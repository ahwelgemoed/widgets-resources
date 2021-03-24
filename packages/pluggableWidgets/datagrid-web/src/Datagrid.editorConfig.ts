import {
    changePropertyIn,
    ContainerProps,
    DropZoneProps,
    hideNestedPropertiesIn,
    hidePropertiesIn,
    hidePropertyIn,
    Problem,
    Properties,
    RowLayoutProps,
    StructurePreviewProps,
    transformGroupsIntoTabs
} from "@mendix/piw-utils-internal";
import { ColumnsPreviewType, DatagridPreviewProps } from "../typings/DatagridProps";

export function getProperties(
    values: DatagridPreviewProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties {
    values.columns.forEach((column, index) => {
        if (column.showContentAs !== "attribute" && !column.sortable && !values.columnsFilterable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "attribute");
        }
        if (column.showContentAs !== "dynamicText") {
            hidePropertyIn(defaultProperties, values, "columns", index, "dynamicText");
        }
        if (column.showContentAs !== "customContent") {
            hidePropertyIn(defaultProperties, values, "columns", index, "content");
        }
        if (!values.columnsSortable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "sortable");
        }
        if (!values.columnsFilterable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "filter");
        }
        if (!values.columnsResizable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "resizable");
        }
        if (!values.columnsDraggable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "draggable");
        }
        if (!values.columnsHidable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "hidable");
        }
        if (column.width !== "manual") {
            hidePropertyIn(defaultProperties, values, "columns", index, "size");
        }
        if (!values.advanced) {
            hideNestedPropertiesIn(defaultProperties, values, "columns", index, [
                "columnClass",
                "sortable",
                "resizable",
                "draggable",
                "hidable"
            ]);
        }
    });
    if (values.pagination !== "buttons") {
        hidePropertyIn(defaultProperties, values, "pagingPosition");
    }
    if (!values.advanced) {
        hidePropertiesIn(defaultProperties, values, [
            "pagination",
            "pagingPosition",
            "showEmptyPlaceholder",
            "rowClass",
            "columnsSortable",
            "columnsDraggable",
            "columnsResizable",
            "columnsHidable",
            "configurationAttribute",
            "onConfigurationChange"
        ]);
    }
    changePropertyIn(
        defaultProperties,
        values,
        prop => {
            prop.objectHeaders = ["Caption", "Content", "Width", "Alignment"];
            prop.objects?.forEach((object, index) => {
                const column = values.columns[index];
                const header = column.header ? column.header : "[Empty caption]";
                const alignment = column.alignment;
                object.captions = [
                    header,
                    column.showContentAs === "attribute"
                        ? column.attribute
                            ? column.attribute
                            : "[No attribute selected]"
                        : column.showContentAs === "dynamicText"
                        ? column.dynamicText
                        : "Custom content",
                    column.width === "autoFill"
                        ? "Auto-fill"
                        : column.width === "autoFit"
                        ? "Auto-fit content"
                        : `Manual (${column.size})`,
                    alignment ? alignment.charAt(0).toUpperCase() + alignment.slice(1) : ""
                ];
            });
        },
        "columns"
    );
    if (platform === "web") {
        transformGroupsIntoTabs(defaultProperties);
    }
    return defaultProperties;
}

export const getPreview = (values: DatagridPreviewProps): StructurePreviewProps => {
    const hasColumns = values.columns && values.columns.length > 0;
    const columnProps: ColumnsPreviewType[] = hasColumns
        ? values.columns
        : [
              {
                  header: "Column",
                  attribute: "",
                  width: "autoFit",
                  columnClass: "",
                  filter: { widgetCount: 0, renderer: () => null },
                  resizable: false,
                  showContentAs: "attribute",
                  content: { widgetCount: 0, renderer: () => null },
                  dynamicText: "Dynamic text",
                  draggable: false,
                  hidable: "no",
                  size: 1,
                  sortable: false,
                  alignment: "left"
              }
          ];
    const columns: RowLayoutProps = {
        type: "RowLayout",
        columnSize: "fixed",
        children: columnProps.map(
            column =>
                ({
                    type: "Container",
                    borders: true,
                    grow: column.width === "manual" && column.size ? column.size : 1,
                    backgroundColor: values.columnsHidable && column.hidable === "hidden" ? "#F5F5F5" : undefined,
                    children: [
                        column.showContentAs === "customContent"
                            ? {
                                  type: "DropZone",
                                  property: column.content
                              }
                            : {
                                  type: "Container",
                                  padding: 8,
                                  children: [
                                      {
                                          type: "Text",
                                          content:
                                              column.showContentAs === "dynamicText"
                                                  ? column.dynamicText ?? "Dynamic text"
                                                  : `[${
                                                        column.attribute ? column.attribute : "No attribute selected"
                                                    }]`,
                                          fontSize: 10
                                      }
                                  ]
                              }
                    ]
                } as ContainerProps)
        )
    };
    const titleHeader: RowLayoutProps = {
        type: "RowLayout",
        columnSize: "fixed",
        backgroundColor: "#daeffb",
        borders: true,
        borderWidth: 1,
        children: [
            {
                type: "Container",
                padding: 4,
                children: [
                    {
                        type: "Text",
                        content: "Data grid 2",
                        fontColor: "#2074c8"
                    }
                ]
            }
        ]
    };
    const headers: RowLayoutProps = {
        type: "RowLayout",
        columnSize: "fixed",
        children: columnProps.map(column => {
            const isColumnHidden = values.columnsHidable && column.hidable === "hidden";
            const content: ContainerProps = {
                type: "Container",
                borders: true,
                grow:
                    values.columns.length > 0
                        ? column.width === "manual" && column.size
                            ? column.size
                            : 1
                        : undefined,
                backgroundColor: isColumnHidden ? "#DCDCDC" : "#F5F5F5",
                children: [
                    {
                        type: "Container",
                        padding: 8,
                        children: [
                            {
                                type: "Text",
                                bold: true,
                                fontSize: 10,
                                content: column.header ? column.header : "Header",
                                fontColor: column.header ? undefined : isColumnHidden ? "#DCDCDC" : "#F5F5F5"
                            }
                        ]
                    },
                    ...(hasColumns && values.columnsFilterable
                        ? [
                              {
                                  type: "DropZone",
                                  property: column.filter,
                                  placeholder: "Place filter widget here"
                              } as DropZoneProps
                          ]
                        : [])
                ]
            };
            return values.columns.length > 0
                ? {
                      type: "Selectable",
                      object: column,
                      grow: column.width === "manual" && column.size ? column.size : 1,
                      child: {
                          type: "Container",
                          children: [content]
                      }
                  }
                : content;
        })
    };
    const footer =
        values.showEmptyPlaceholder === "custom"
            ? [
                  {
                      type: "RowLayout",
                      columnSize: "fixed",
                      borders: true,
                      children: [
                          {
                              type: "DropZone",
                              property: values.emptyPlaceholder,
                              placeholder: "Empty list message: Place widgets here"
                          } as DropZoneProps
                      ]
                  } as RowLayoutProps
              ]
            : [];
    return {
        type: "Container",
        children: [titleHeader, headers, ...Array.from({ length: 5 }).map(() => columns), ...footer]
    };
};

export function check(values: DatagridPreviewProps): Problem[] {
    const errors: Problem[] = [];
    values.columns.forEach((column: ColumnsPreviewType, index) => {
        if (column.showContentAs === "attribute" && !column.attribute) {
            errors.push({
                property: `columns/${index + 1}/attribute`,
                message: `An attribute is required when 'Show' is set to 'Attribute'. Select the 'Attribute' property for column ${column.header}`
            });
        } else if (!column.attribute && (column.sortable || values.columnsFilterable)) {
            errors.push({
                property: `columns/${index + 1}/attribute`,
                message: `An attribute is required when filtering or sorting is enabled. Select the 'Attribute' property for column ${column.header}`
            });
        }
        if (values.columnsHidable && column.hidable !== "no" && !column.header) {
            errors.push({
                property: `columns/${index + 1}/hidable`,
                message:
                    "A caption is required if 'Can hide' is Yes or Yes, hidden by default. This can be configured under 'Column capabilities' in the column item properties"
            });
        }
    });

    return errors;
}
