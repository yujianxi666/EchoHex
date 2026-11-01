#!/usr/bin/env python3
"""Fetch all public GitHub repositories for the site.

Usage:
    python scripts/fetch-github.py          # Windows
    python3 scripts/fetch-github.py         # Linux / macOS

The username and output path are read from assets/js/site.config.js:
    work: {
      github: {
        username: "yujianxi666",
        data: "assets/data/github-projects.js"
      }
    }

Set GITHUB_TOKEN to raise the API rate limit (optional):
    Windows:  set GITHUB_TOKEN=ghp_xxx && python scripts/fetch-github.py
    Linux:    GITHUB_TOKEN=ghp_xxx python3 scripts/fetch-github.py

Only Python's standard library is required. Works on Windows and Linux.
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "assets/js/site.config.js"
DEFAULT_OUTPUT = "assets/data/github-projects.js"
API = "https://api.github.com/users/{username}/repos?per_page=100&page={page}&sort=updated"


def fail(message: str) -> None:
    print("error: " + message, file=sys.stderr)
    raise SystemExit(1)


def read_config() -> tuple[str, str]:
    if not CONFIG.exists():
        fail("config not found: " + str(CONFIG))

    text = CONFIG.read_text(encoding="utf-8")
    username_match = re.search(
        r"github\s*:\s*\{[^}]*?username\s*:\s*\"([^\"]+)\"", text, re.S
    )
    if not username_match:
        fail(
            "could not find work.github.username in assets/js/site.config.js; "
            "add it under work.github first"
        )

    data_match = re.search(
        r"github\s*:\s*\{[^}]*?data\s*:\s*\"([^\"]+)\"", text, re.S
    )

    username = username_match.group(1).strip()
    output = data_match.group(1).strip() if data_match else DEFAULT_OUTPUT
    if not username:
        fail("work.github.username is empty")

    return username, output


def fetch_page(username: str, page: int, token: str) -> list[dict]:
    request = Request(
        API.format(username=quote(username), page=page),
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "EchoHex-fetch-github",
            "X-GitHub-Api-Version": "2022-11-28",
            **({"Authorization": "Bearer " + token} if token else {}),
        },
    )
    try:
        with urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        body = ""
        try:
            body = error.read().decode("utf-8", errors="replace")[:300]
        except Exception:
            pass
        if error.code == 404:
            fail("GitHub user not found: @" + username)
        if error.code in (403, 429):
            reset = error.headers.get("X-RateLimit-Reset", "")
            hint = " set GITHUB_TOKEN to use a higher rate limit." if not token else ""
            fail(
                "GitHub API rate limit or access denied (HTTP %s).%s%s"
                % (error.code, hint, (" " + body) if body else "")
            )
        fail("GitHub API returned HTTP %s. %s" % (error.code, body))
    except URLError as error:
        fail("network error: %s" % error.reason)
    except TimeoutError:
        fail("network timeout while requesting GitHub")

    if not isinstance(payload, list):
        fail("unexpected GitHub API response")

    return payload


def normalise(repo: dict) -> dict:
    return {
        "name": repo.get("name", ""),
        "full_name": repo.get("full_name", ""),
        "description": repo.get("description") or "",
        "html_url": repo.get("html_url", ""),
        "homepage": repo.get("homepage") or "",
        "language": repo.get("language") or "",
        "stargazers_count": int(repo.get("stargazers_count") or 0),
        "forks_count": int(repo.get("forks_count") or 0),
        "fork": bool(repo.get("fork")),
        "archived": bool(repo.get("archived")),
        "topics": repo.get("topics") or [],
        "updated_at": repo.get("updated_at") or "",
        "pushed_at": repo.get("pushed_at") or "",
    }


def main() -> None:
    username, output = read_config()
    token = os.environ.get("GITHUB_TOKEN", "").strip()

    repos: list[dict] = []
    seen: set[int] = set()
    page = 1
    while page <= 10:
        batch = fetch_page(username, page, token)
        for repo in batch:
            repo_id = repo.get("id")
            if repo_id in seen:
                continue
            seen.add(repo_id)
            repos.append(normalise(repo))
        print("fetched page %d: %d repositories" % (page, len(batch)))
        if len(batch) < 100:
            break
        page += 1

    repos.sort(key=lambda repo: repo.get("pushed_at", ""), reverse=True)

    payload = {
        "username": username,
        "fetchedAt": datetime.now(timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z"),
        "count": len(repos),
        "repos": repos,
    }

    output_path = ROOT / output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    js = (
        "/* Generated by scripts/fetch-github.py. Do not edit by hand. */\n"
        "window.GITHUB_PROJECTS = "
        + json.dumps(repos, ensure_ascii=False, indent=2)
        + ";\n"
        + "window.GITHUB_PROJECTS_META = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n"
    )
    output_path.write_text(js, encoding="utf-8", newline="\n")

    print(
        "wrote %d repositories for @%s -> %s"
        % (len(repos), username, output_path.relative_to(ROOT))
    )


if __name__ == "__main__":
    main()
