import {
    GroupByDayOptionsEnum,
    GroupByKeyEnum,
    GroupByMonthOptionsEnum,
    TimelinePreviewProps
} from "../typings/TimelineProps";
import TimelineComponent from "./components/TimelineComponent";
import { createElement } from "react";
import { BasicItemType, CustomItemType, ItemType } from "./Timeline";

declare function require(name: string): string;

export function preview(props: TimelinePreviewProps) {
    const structuredEvents = () => {
        const eventsMap = new Map<string, ItemType[]>();
        let groupKey = "";

        Array.from({ length: 5 }).forEach(() => {
            let constructedItem: ItemType;
            if (!props.customVisualization) {
                groupKey = getGroupHeaderByType(
                    props.groupByKey === "day"
                        ? props.groupByDayOptions
                        : props.groupByKey === "month"
                        ? props.groupByMonthOptions
                        : "year"
                );
                constructedItem = {
                    icon: props.icon,
                    title: props.title === String.fromCharCode(160) ? "Title" : props.title,
                    eventDateTime:
                        props.timeIndication === String.fromCharCode(160) ? "Optional Time" : props.timeIndication,
                    description:
                        props.description === String.fromCharCode(160) ? "Optional Description" : props.description
                } as BasicItemType;
            } else {
                groupKey = props.groupByKey;
                constructedItem = {
                    icon: (
                        <props.customIcon.renderer>
                            <div />
                        </props.customIcon.renderer>
                    ),
                    groupHeader: (
                        <props.customGroupHeader.renderer>
                            <div />
                        </props.customGroupHeader.renderer>
                    ),
                    title: (
                        <props.customTitle.renderer>
                            <div />
                        </props.customTitle.renderer>
                    ),
                    eventDateTime: (
                        <props.customEventDateTime.renderer>
                            <div />
                        </props.customEventDateTime.renderer>
                    ),
                    description: (
                        <props.customDescription.renderer>
                            <div />
                        </props.customDescription.renderer>
                    )
                } as CustomItemType;
            }

            const currentDates = eventsMap.get(groupKey);
            if (currentDates) {
                currentDates.push(constructedItem);
            } else {
                eventsMap.set(groupKey, [constructedItem]);
            }
        });

        return eventsMap;
    };
    return (
        <TimelineComponent
            data={structuredEvents()}
            customVisualization={props.customVisualization}
            groupEvents={props.groupEvents}
            ungroupedEventsPosition={props.ungroupedEventsPosition}
        />
    );
}

function getGroupHeaderByType(option: GroupByDayOptionsEnum | GroupByMonthOptionsEnum | GroupByKeyEnum) {
    switch (option) {
        case "fullDate":
        case "day":
            return "9/23/2020, 12:00 AM";
        case "dayName":
            return "Thursday";
        case "dayMonth":
            return "09 October";
        case "month":
            return "October";
        case "monthYear":
            return "Oct 2020";
        default:
            return "2020";
    }
}

export function getPreviewCss(): string {
    return require("./ui/TimelinePreview.scss");
}
