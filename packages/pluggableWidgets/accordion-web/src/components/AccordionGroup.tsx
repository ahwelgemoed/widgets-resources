import { createElement, Dispatch, ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { AccordionGroupsReducerAction } from "../utils/AccordionGroupStateReducer";
import classNames from "classnames";

import "../ui/accordion-main.scss";

export interface AccGroup {
    header: ReactNode;
    content: ReactNode;
    collapsed?: boolean;
    visible: boolean;
    dynamicClassName?: string;
}

export type AccordionGroupIcon = { icon: ReactNode } | { expandIcon: ReactNode; collapseIcon: ReactNode };

export interface AccordionGroupProps {
    group: AccGroup;
    accordionGroupsDispatch?: Dispatch<AccordionGroupsReducerAction>;
    animateCollapsing?: boolean;
    generateIcon?: (collapsed: boolean) => ReactElement;
    showHeaderIcon?: "right" | "left" | "no";
}

export default function AccordionGroup(props: AccordionGroupProps): ReactElement | null {
    const { group, accordionGroupsDispatch, animateCollapsing, showHeaderIcon } = props;

    const [previousCollapsedPropValue, setPreviousCollapsedPropValue] = useState(group.collapsed);

    const rootElement = useRef<HTMLDivElement>(null);
    const contentWrapperElement = useRef<HTMLDivElement>(null);
    const contentElement = useRef<HTMLDivElement>(null);

    const completeCollapsing = useCallback((): void => {
        if (contentWrapperElement.current && rootElement.current) {
            if (!previousCollapsedPropValue) {
                rootElement.current.classList.add("widget-accordion-group-collapsed");
                rootElement.current.classList.remove("widget-accordion-group-collapsing");
                setPreviousCollapsedPropValue(true);
            } else {
                rootElement.current.classList.remove("widget-accordion-group-expanding");
                contentWrapperElement.current.style.height = "";
                setPreviousCollapsedPropValue(false);
            }
        }
    }, [previousCollapsedPropValue]);

    useEffect(() => {
        if (
            group.collapsed !== previousCollapsedPropValue &&
            rootElement.current &&
            contentWrapperElement.current &&
            contentElement.current &&
            animateCollapsing
        ) {
            if (group.collapsed) {
                contentWrapperElement.current.style.height = `${
                    contentElement.current.getBoundingClientRect().height
                }px`;
                rootElement.current.classList.add("widget-accordion-group-collapsing");

                setTimeout(() => {
                    if (contentWrapperElement.current) {
                        contentWrapperElement.current.style.height = "";
                    }
                }, 200); // the animation is already ongoing. That's why we need to wait.

                // window.requestAnimationFrame(() => {
                //     contentWrapperElement.current.style.height = "";
                // }); // TODO Check how this behaves when we have multiple transitions with accordion groups: maybe removing height:0 from collapsing style will solve the issue
            } else {
                rootElement.current.classList.add("widget-accordion-group-expanding");
                rootElement.current.classList.remove("widget-accordion-group-collapsed");
                contentWrapperElement.current.style.height = `${
                    contentElement.current.getBoundingClientRect().height
                }px`;
            }
        } else if (group.collapsed !== previousCollapsedPropValue && !animateCollapsing) {
            setPreviousCollapsedPropValue(group.collapsed);
        }
    }, [group, previousCollapsedPropValue, animateCollapsing]);

    const toggleContentVisibility = useCallback(() => {
        if (group.collapsed) {
            accordionGroupsDispatch!({ type: "expand", group });
        } else {
            accordionGroupsDispatch!({ type: "collapse", group });
        }
    }, [group, accordionGroupsDispatch]);

    if (!group.visible) {
        return null;
    }

    return (
        <section
            ref={rootElement}
            className={classNames(
                "widget-accordion-group",
                {
                    "widget-accordion-group-collapsed": previousCollapsedPropValue
                },
                group.dynamicClassName
            )}
        >
            <header
                className={classNames("widget-accordion-group-header", {
                    "widget-accordion-group-header-clickable": accordionGroupsDispatch,
                    "widget-accordion-group-header-icon-left": accordionGroupsDispatch && showHeaderIcon === "left",
                    "widget-accordion-group-header-icon-right": accordionGroupsDispatch && showHeaderIcon === "right"
                })}
                onClick={accordionGroupsDispatch ? toggleContentVisibility : undefined}
            >
                {group.header}
                {accordionGroupsDispatch && showHeaderIcon !== "no" && showHeaderIcon
                    ? props.generateIcon?.(previousCollapsedPropValue ?? false)
                    : null}
            </header>
            <div
                ref={contentWrapperElement}
                className={"widget-accordion-group-content-wrapper"}
                onTransitionEnd={completeCollapsing}
            >
                <div ref={contentElement} className={"widget-accordion-group-content"}>
                    {group.content}
                </div>
            </div>
        </section>
    );
}
