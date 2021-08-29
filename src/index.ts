import debounce from './debounce';

declare global {
    interface HTMLElement {
        addOverflowEventListener(
            callback: (element: HTMLElement, direction: OverflowDirections, overflow: boolean) => void,
            options: IOverflowEventListenerOptions
        ): void;
    }
}

export interface IOverflowEventListenerOptions {
    triggerOnInit: boolean;
}

export type OverflowDirections = 'up' | 'left' | 'right' | 'down';

interface IScrollableDirections {
    up: boolean;
    right: boolean;
    down: boolean;
    left: boolean;
}

function scrollableToLeft(element: HTMLElement): boolean {
    return element.scrollLeft > 0;
}

function scrollableToRight(element: HTMLElement): boolean {
    return element.scrollLeft < element.scrollWidth - element.offsetWidth;
}

function scrollableToTop(element: HTMLElement): boolean {
    return element.scrollTop > 0;
}

function scrollableToBottom(element: HTMLElement): boolean {
    return element.scrollTop < element.scrollHeight - element.offsetHeight;
}

function getScrollableDirections(element: HTMLElement): IScrollableDirections {
    return {
        up: scrollableToTop(element),
        right: scrollableToRight(element),
        down: scrollableToBottom(element),
        left: scrollableToLeft(element),
    };
}

function checkScrollableDirectionChange(
    element: HTMLElement,
    oldScrollableDirections: IScrollableDirections,
    callback: (element: HTMLElement, direction: OverflowDirections, overflow: boolean) => void
): IScrollableDirections {
    const newScrollableDirections = getScrollableDirections(element);
    Object.entries(newScrollableDirections).forEach(([direction, overflow]) => {
        if (oldScrollableDirections[direction as OverflowDirections] !== overflow) {
            callback(element, direction as OverflowDirections, overflow);
        }
    });
    return newScrollableDirections;
}

HTMLElement.prototype.addOverflowEventListener = function addOverflowEventListener(
    callback: (element: HTMLElement, direction: OverflowDirections, overflow: boolean) => void,
    options?: IOverflowEventListenerOptions
): void {
    const element = this as HTMLElement;
    let scrollableDirections: IScrollableDirections = getScrollableDirections(element);
    if (options.triggerOnInit === true) {
        Object.entries(scrollableDirections).forEach(([direction, overflow]) => {
            callback(element, direction as OverflowDirections, overflow);
        });
    }

    const debouncedCheck = debounce((): void => {
        scrollableDirections = checkScrollableDirectionChange(element, scrollableDirections, callback);
    }, 100);

    element.addEventListener('scroll', debouncedCheck);
    window.addEventListener('resize', debouncedCheck);
};
