import type { executeIOCIntelRequest } from '@src/lib/IOC/execute-IOC-Intel';
import { detectIOCType } from '@src/lib/IOC/ioc-utils';
import { debounce } from '@src/lib/utils/debounce';
import Browser from 'webextension-polyfill';

/**
 * Floating prompt button displayed above selected IOC text.
 */
let promptButton: HTMLButtonElement | null = null;

/**
 * Icon element inside the prompt button.
 */
let promptButtonIcon: HTMLImageElement | null = null;

/**
 * Style element injected for the prompt button.
 */
let promptButtonStyle: HTMLStyleElement | null = null;

/**
 * Raw CSS injected for the IOC prompt button.
 */
const promptButtonRawCSS = `
.iocintel-prompt-button {
    display: flex;
    position: absolute;
    cursor: pointer;

    width: 2.5rem;
    height: 2rem;
    /* --clr-dark-surface-alt*/
    background: rgb(45, 45, 45);
    padding: 0.5rem;
    border: none;
    border-radius: 0.25rem;
    z-index: 999999999;

    &:hover {
        /* --clr-dark-surface */
        background: rgb(35, 35, 35);
    }

    /* --shadow-lg */
    box-shadow: -4px 0px 8px rgba(255, 255, 255, 0.05),
    0px -4px 8px rgba(255, 255, 255, 0.05),
    -4px -4px 8px rgba(255, 255, 255, 0.05),
    4px 0px 8px rgba(0, 0, 0, 0.5),
    0px 4px 8px rgba(0, 0, 0, 0.5),
    4px 4px 8px rgba(0, 0, 0, 0.5);

    .iocintel-prompt-icon {
        height: 100%;
        width: 100%;;
    }

}`;

/**
 * Creates the IOC prompt button, its icon, and injects styles.
 * Any existing button instance is removed before creation.
 */
const createIOCPromptButton = (): void => {
    const iconDataUrl = `data:image/svg+xml;base64,PHN2ZyBpZD0ibG9nbyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzYgMzYiPjxwYXRoIGZpbGw9IiM5OUFBQjUiIGQ9Ik04LjUxNCAxOS44MjhMMTkuMTIyIDkuMjIzbDIuMTIxIDIuMTIxTDEwLjYzNSAyMS45NXoiIC8+PHBhdGggZmlsbD0iIzU1QUNFRSIgZD0iTTguNTE1IDI5LjcyOGMtLjc4MS43ODEtMi4wNDcuNzgxLTIuODI4IDBsLTQuOTUtNC45NDljLS43ODEtLjc4MS0uNzgxLTIuMDQ4IDAtMi44MjhMNS42ODcgMTdjLjc4MS0uNzgxIDIuMDQ3LS43ODEgMi44MjggMGw0Ljk1IDQuOTVjLjc4MS43OC43ODEgMi4wNDcgMCAyLjgyOGwtNC45NSA0Ljk1em0xNi4yNjItMTYuMjYzYy0uNzguNzgxLTIuMDQ3Ljc4MS0yLjgyNyAwTDE3IDguNTE1Yy0uNzgxLS43ODEtLjc4MS0yLjA0NyAwLTIuODI4bDQuOTUxLTQuOTVjLjc4MS0uNzgxIDIuMDQ3LS43ODEgMi44MjggMGw0Ljk0OSA0Ljk1Yy43ODEuNzgxLjc4MSAyLjA0Ny4wMDEgMi44MjhsLTQuOTUyIDQuOTV6IiAvPjxwYXRoIGZpbGw9IiM5OUFBQjUiIGQ9Ik0xMi40MDQgMTAuMjgzTDEwLjk5IDYuMDRjLS40NDgtMS4zNDItMS40MTUtMS40MTUtMi4xMjItLjcwOEw2LjA0IDguMTYxYy0uNzA4LjcwNy0uNjM1IDEuNjc0LjcwNyAyLjEyMmw0LjI0MyAxLjQxNCAxLjQxNC0xLjQxNHoiIC8+PHBhdGggZmlsbD0iI0NDRDZERCIgZD0iTTE3LjcwOCAyMS45NDljLS43ODIuNzgxLTIuMDQ4Ljc4MS0yLjgyOS4wMDFsLTcuMDcxLTcuMDcxYy0uNzgxLS43ODEtLjc4MS0yLjA0OCAwLTIuODI5bDQuMjQyLTQuMjQyYy43ODEtLjc4MSAyLjA0OC0uNzgxIDIuODI5IDBsNy4wNzEgNy4wNzFjLjc4Ljc4MS43OCAyLjA0Ny0uMDAxIDIuODI5bC00LjI0MSA0LjI0MXoiIC8+PHBhdGggZmlsbD0iI0NDRDZERCIgZD0iTTIxLjAxNiAyMS4wNTVjLTEuOTUyIDEuOTUzLTQuODAyIDIuMjY5LTYuMzY0LjcwOC0xLjU2Mi0xLjU2Mi44NzYtMi4yOSAyLjgyOS00LjI0MyAxLjk1My0xLjk1MyAyLjY4MS00LjM5IDQuMjQzLTIuODI5IDEuNTYxIDEuNTYyIDEuMjQ1IDQuNDExLS43MDggNi4zNjR6IiAvPjxwYXRoIGZpbGw9IiM5OUFBQjUiIGQ9Ik0yNy45NiAyMC4xODJjLTIuMTItMi4xMjItNS4xMTgtMS45NTEtNy4wNzEgMC0xLjk1MiAxLjk1NC0yLjEyMSA0Ljk1IDAgNy4wNzFsNy4wNzEtNy4wNzF6bS0yLjgyOCAyLjgyOWwyLjEyMSAzLjUzNS0zLjUzNS0yLjEyMXoiIC8+PHBhdGggZmlsbD0iIzk5QUFCNSIgZD0iTTI3LjgxMyAyNy4xMDZjLS4zOTEuMzkxLTEuMDIzLjM5MS0xLjQxNCAwcy0uMzkxLTEuMDIzIDAtMS40MTQgMS4wMjMtLjM5MSAxLjQxNCAwIC4zOTEgMS4wMjQgMCAxLjQxNHoiIC8+PHBhdGggZmlsbD0iIzg4QzlGOSIgZD0iTTQuMjcgMTguNDE2TDUuNjg2IDE3bDcuNzc5IDcuNzc3LTEuNDE0IDEuNDE1ek0xNyA1LjY4NmwxLjQxNC0xLjQxNCA3Ljc3OCA3Ljc3OC0xLjQxNCAxLjQxNHpNLjczNSAyMS45NTJsMS40MTQtMS40MTUgNy43OCA3Ljc3Ni0xLjQxNCAxLjQxNHptMTkuNzk4LTE5LjhMMjEuOTQ2LjczN2w3Ljc4MSA3Ljc3NS0xLjQxMyAxLjQxNHoiIC8+PHBhdGggZmlsbD0iIzk5QUFCNSIgZD0iTTguMzA3IDcuNjAxYy0uMzkuMzktMS4wMjMuMzktMS40MTQgMC0uMzkxLS4zOTEtLjM5LTEuMDI0IDAtMS40MTUuMzkxLS4zOSAxLjAyMy0uMzkgMS40MTQgMCAuMzkxLjM5MS4zOTEgMS4wMjQgMCAxLjQxNXoiIC8+PHBhdGggZmlsbD0iI0ZGQUMzMyIgZD0iTTIzLjY4MiAzMC40MzFsLjAwMi0uMDUxYy4wMjctLjU1Mi40OTctLjk3NyAxLjA0OS0uOTQ5LjAxNi4wMDEgMi4xNTYuMDYzIDMuOC0xLjU4IDEuNjM3LTEuNjM4IDEuNTc4LTMuNzcyIDEuNTgtMy44MDEtLjAzMy0uNTUuMzk3LTEuMDIxLjk0OC0xLjA0OS41NTItLjAyNyAxLjAyMi4zOTcgMS4wNDkuOTQ5LjAxMi4xMjIuMTIzIDMuMDI4LTIuMTYzIDUuMzE0LTIuMjg4IDIuMjg3LTUuMTkxIDIuMTctNS4zMTQgMi4xNjQtLjUzNS0uMDI3LS45NTEtLjQ2OC0uOTUxLS45OTd6IiAvPjxwYXRoIGZpbGw9IiNGRkFDMzMiIGQ9Ik0yNC4yMzggMzMuOTg5YzAtLjEwOS4wMTgtLjIyMS4wNTctLjMzLjE4Mi0uNTIxLjc1Mi0uNzk2IDEuMjczLS42MTMuMTA3LjAzNCAyLjg3Ny44OTMgNS45NjQtMi4xOTUgMy4xMjctMy4xMjYgMi40MTQtNi4xMjYgMi4zODItNi4yNTItLjEzNy0uNTI5LjE4NC0xLjA3Ny43MTYtMS4yMTYuNTMtLjE0IDEuMDczLjE3MiAxLjIxNy43MDEuMDQ2LjE3IDEuMDc3IDQuMjA1LTIuOSA4LjE4MS00LjAxNCA0LjAxNi03Ljg3NiAyLjcyNi04LjAzOCAyLjY2OC0uNDEzLS4xNDQtLjY3MS0uNTMxLS42NzEtLjk0NHoiIC8+PC9zdmc+`;
    destroyIOCPromptButton();

    promptButton = document.createElement('button');
    promptButton.className = 'iocintel-prompt-button';

    promptButtonIcon = document.createElement('img');
    promptButtonIcon.className = 'iocintel-prompt-icon';
    promptButtonIcon.alt = 'Investigate IOC';
    promptButtonIcon.src = iconDataUrl;

    promptButton.appendChild(promptButtonIcon);

    promptButtonStyle = document.createElement('style');
    promptButtonStyle.textContent = promptButtonRawCSS;
    document.head.appendChild(promptButtonStyle);
};

/**
 * Removes the prompt button, icon, and injected styles from the DOM.
 * Safe to call multiple times.
 */
const destroyIOCPromptButton = (): void => {
    promptButton && (promptButton.remove(), (promptButton = null));
    promptButtonIcon && (promptButtonIcon.remove(), (promptButtonIcon = null));
    promptButtonStyle &&
        (promptButtonStyle.remove(), (promptButtonStyle = null));
};

/**
 * Positions the prompt button centered horizontally above a given rectangle.
 *
 * @param rect - Bounding rectangle of the text selection
 */
const positionFromRect = (rect: DOMRect): void => {
    !promptButton && createIOCPromptButton();

    const buttonWidth = promptButton!.offsetWidth;
    const buttonHeight = promptButton!.offsetHeight;

    const left = rect.left + window.scrollX + rect.width / 2 - buttonWidth / 2;
    const top = rect.top + window.scrollY - buttonHeight - 10;

    promptButton!.style.left = `${left}px`;
    promptButton!.style.top = `${top}px`;
};

/**
 * Computes the bounding rectangle of the selected text inside an
 * `<input>` or `<textarea>` element by mirroring its styles and content.
 *
 * Browsers do not expose caret geometry for these elements, so a hidden
 * mirror element is required.
 *
 * @param el - Input or textarea element
 * @param start - Selection start index
 * @param end - Selection end index
 * @returns Bounding rectangle of the selected text
 */
const getInputSelectionRect = (
    el: HTMLInputElement | HTMLTextAreaElement,
    start: number,
    end: number
): DOMRect => {
    const mirror = document.createElement('div');
    const style = getComputedStyle(el);
    const elRect = el.getBoundingClientRect();

    mirror.style.position = 'absolute';
    mirror.style.left = `${elRect.left + window.scrollX}px`;
    mirror.style.top = `${elRect.top + window.scrollY}px`;

    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace =
        el instanceof HTMLTextAreaElement ? 'pre-wrap' : 'pre';
    mirror.style.wordWrap = 'break-word';

    mirror.style.boxSizing = style.boxSizing;
    mirror.style.width = style.width;
    mirror.style.height = style.height;
    mirror.style.padding = style.padding;
    mirror.style.border = style.border;

    mirror.style.fontFamily = style.fontFamily;
    mirror.style.fontSize = style.fontSize;
    mirror.style.fontWeight = style.fontWeight;
    mirror.style.fontStyle = style.fontStyle;
    mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.textTransform = style.textTransform;
    mirror.style.textAlign = style.textAlign;

    mirror.scrollTop = el.scrollTop;
    mirror.scrollLeft = el.scrollLeft;

    mirror.textContent = el.value.slice(0, start);

    const span = document.createElement('span');
    span.textContent = el.value.slice(start, end) || '.';
    mirror.appendChild(span);

    document.body.appendChild(mirror);
    const rect = span.getBoundingClientRect();
    document.body.removeChild(mirror);

    return rect;
};

/**
 * Positions the IOC prompt button based on the current text selection.
 *
 * Supports:
 * - Standard DOM selections (e.g. p, h1, spans)
 * - `<input>` and `<textarea>` selections
 */
const positionButton = (): void => {
    const active = document.activeElement;

    if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement
    ) {
        const { selectionStart, selectionEnd } = active;

        if (
            selectionStart === null ||
            selectionEnd === null ||
            selectionStart === selectionEnd
        ) {
            destroyIOCPromptButton();
            return;
        }

        const rect = getInputSelectionRect(
            active,
            selectionStart,
            selectionEnd
        );

        positionFromRect(rect);
        return;
    }

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const text = selection.toString().trim();
    if (!text) {
        destroyIOCPromptButton();
        return;
    }

    const range = selection.getRangeAt(0);
    positionFromRect(range.getBoundingClientRect());
};

/**
 * Handles selection changes and determines whether to show the IOC prompt.
 * Debounced to reduce layout and selection churn.
 */
const handleSelectionChange = debounce(
    async () => {
        const active = document.activeElement;
        let selectedText = '';

        if (
            active instanceof HTMLInputElement ||
            active instanceof HTMLTextAreaElement
        ) {
            const { selectionStart, selectionEnd, value } = active;
            if (
                selectionStart !== null &&
                selectionEnd !== null &&
                selectionStart !== selectionEnd
            ) {
                selectedText = value.slice(selectionStart, selectionEnd).trim();
            }
        } else {
            selectedText = window.getSelection()?.toString().trim() || '';
        }

        if (!selectedText) return;

        if (detectIOCType(selectedText)) {
            !promptButton && createIOCPromptButton();
            document.body.append(promptButton!);
            positionButton();
        } else {
            destroyIOCPromptButton();
        }
    },
    { delay: 10, maxWait: 50 }
);

/**
 * Repositions the prompt button on window resize.
 */
const handleResize = debounce(
    async () => {
        positionButton();
    },
    { delay: 10, maxWait: 50 }
);

/**
 * Handles clicks on the document.
 * Executes IOC intel request when the prompt button is clicked.
 *
 * @param event - Mouse click event
 */
const handleClick = (event: MouseEvent): void => {
    if (!promptButton) return;

    const active = document.activeElement;
    let selectedText = '';

    if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement
    ) {
        const { selectionStart, selectionEnd, value } = active;
        if (
            selectionStart !== null &&
            selectionEnd !== null &&
            selectionStart !== selectionEnd
        ) {
            selectedText = value.slice(selectionStart, selectionEnd).trim();
        }
    } else {
        selectedText = window.getSelection()?.toString().trim() || '';
    }

    if (!selectedText) {
        destroyIOCPromptButton();
        return;
    }

    if (promptButton.contains(event.target as Node)) {
        const IOCIntelRequest: executeIOCIntelRequest = {
            action: 'executeIOCIntel',
            IOC: selectedText,
        };
        Browser.runtime.sendMessage(IOCIntelRequest);
    }
};

/**
 * Event listeners
 */
document.addEventListener('selectionchange', handleSelectionChange);
window.addEventListener('resize', handleResize);
document.addEventListener('click', handleClick);
