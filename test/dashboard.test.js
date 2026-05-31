import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

class MockClassList {
    constructor() {
        this.classes = new Set();
    }

    add(...classes) {
        classes.forEach(className => this.classes.add(className));
    }

    toggle(className, force) {
        if (force === true) {
            this.classes.add(className);
            return true;
        }

        if (force === false) {
            this.classes.delete(className);
            return false;
        }

        if (this.classes.has(className)) {
            this.classes.delete(className);
            return false;
        }

        this.classes.add(className);
        return true;
    }

    contains(className) {
        return this.classes.has(className);
    }
}

class MockElement {
    constructor(id = "") {
        this.id = id;
        this.children = [];
        this.classList = new MockClassList();
        this.innerHTML = "";
        this.listeners = {};
        this.attributes = {};
        this.value = "";
    }

    get firstChild() {
        return this.children[0] ?? null;
    }

    addEventListener(type, listener) {
        this.listeners[type] = listener;
    }

    appendChild(child) {
        this.children.push(child);
        return child;
    }

    dispatch(type) {
        this.listeners[type]({ target: this });
    }

    removeChild(child) {
        const childIndex = this.children.indexOf(child);
        this.children.splice(childIndex, 1);
        return child;
    }

    setAttribute(name, value) {
        this.attributes[name] = String(value);
    }
}

const elementIds = [
    "all-btn",
    "description-container",
    "first-game",
    "funded-btn",
    "games-container",
    "num-contributions",
    "num-games",
    "search-input",
    "second-game",
    "sort-btn",
    "total-raised",
    "unfunded-btn",
];

const elements = new Map(elementIds.map(id => [id, new MockElement(id)]));

globalThis.document = {
    createElement: () => new MockElement(),
    getElementById: id => elements.get(id),
};

await import(`../index.js?test=${Date.now()}`);

const gamesContainer = elements.get("games-container");

test("page includes search and sort controls", async () => {
    const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

    assert.match(html, /id="search-input"/);
    assert.match(html, /id="sort-btn"/);
});

test("game cards display funding details, progress, and funded status", () => {
    const fundedGameCard = gamesContainer.children.find(card => card.innerHTML.includes("Cube Monster"));
    const unfundedGameCard = gamesContainer.children.find(card => card.innerHTML.includes("Heroes Of Mythic Americas"));

    assert.match(fundedGameCard.innerHTML, /\$29,446 raised/);
    assert.match(fundedGameCard.innerHTML, /\$20,000 goal/);
    assert.match(fundedGameCard.innerHTML, /progress-bar/);
    assert.match(fundedGameCard.innerHTML, /Funded/);
    assert.doesNotMatch(unfundedGameCard.innerHTML, /funded-badge/);
});

test("all games filter is highlighted initially and filters update the highlight", () => {
    assert.equal(elements.get("all-btn").classList.contains("active"), true);

    elements.get("unfunded-btn").dispatch("click");

    assert.equal(elements.get("unfunded-btn").classList.contains("active"), true);
    assert.equal(elements.get("all-btn").classList.contains("active"), false);
    assert.equal(gamesContainer.children.length, 7);
});

test("search combines with the selected funding filter", () => {
    const searchInput = elements.get("search-input");
    searchInput.value = "deity";
    searchInput.dispatch("input");

    assert.equal(gamesContainer.children.length, 1);
    assert.match(gamesContainer.children[0].innerHTML, /Deity Tarot/);

    elements.get("funded-btn").dispatch("click");

    assert.equal(gamesContainer.children.length, 0);
});

test("sort button orders currently displayed games by pledged amount", () => {
    const searchInput = elements.get("search-input");
    searchInput.value = "";
    searchInput.dispatch("input");
    elements.get("all-btn").dispatch("click");
    elements.get("sort-btn").dispatch("click");

    assert.match(gamesContainer.children[0].innerHTML, /Zoo Tycoon: The Board Game/);
    assert.equal(elements.get("sort-btn").classList.contains("active"), true);
});

test("styles include a mobile layout", async () => {
    const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

    assert.match(css, /@media\s*\(max-width:\s*700px\)/);
});
