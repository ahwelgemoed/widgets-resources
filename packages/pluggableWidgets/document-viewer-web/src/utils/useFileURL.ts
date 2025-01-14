import { DocumentViewerContainerProps } from "../../typings/DocumentViewerProps";
import { useMemo } from "react";
import { ValueStatus } from "mendix";

type GetUrlSuccess = {
    loading: false;
    error: null;
    data: string;
};

type GetUrlError = {
    loading: false;
    error: string;
    data: null;
};

type GetUrlLoading = {
    loading: true;
    data: null;
    error: null;
};

type UseFileUrlHookResult = GetUrlSuccess | GetUrlError | GetUrlLoading;

function hookResult(status: "ok", payload: string): GetUrlSuccess;
function hookResult(status: "error", payload: string): GetUrlError;
function hookResult(status: "loading", payload?: string): GetUrlLoading;
function hookResult(status: unknown, payload: unknown): unknown {
    return {
        loading: status === "loading",
        data: status === "ok" ? payload : null,
        error: status === "error" ? payload : null
    };
}

/**
 * If FileDocument URL is given, then check that "name" attribute is match
 * extension. If given external URL, check that pathname match extension.
 *
 * @param url - Ether external or FileDocument url wrapped with *URL* class;
 * @param ext - file extension to check against
 */
function matchFileExtension(url: URL, ext: string): boolean {
    const filename = url.searchParams.get("name") || url.pathname;

    return filename.endsWith(ext);
}

/**
 * If FileDocument URL is given, tries to set
 * "target" query param to "window" to make sure that file
 * is viewable in browser.
 *
 * @param url - Ether external or FileDocument url wrapped with *URL* class;
 */
function allowFileViewing(url: URL): string {
    // There no reliable way to detect FileDocument url
    // so we relying on path name and "name" search param
    if (url.pathname === "/file" && url.searchParams.get("name")) {
        url.searchParams.set("target", "window");
    }

    return url.toString();
}

/**
 * Check that src is valid URL and it has correct filename.
 *
 * @param src - File source url to check
 */
function getPreviewUrl(src: string): [Error | null, string] {
    let error: Error | null = null;
    let result = "";

    try {
        const url = new URL(src);
        if (!matchFileExtension(url, ".pdf")) {
            error = new TypeError("unsupported file type");
        } else {
            result = allowFileViewing(url);
        }
    } catch (err) {
        error = err;
    }

    return [error, result];
}

export function useFileURL({
    file,
    dataSourceType,
    url: externalUri
}: DocumentViewerContainerProps): UseFileUrlHookResult {
    return useMemo(() => {
        if (dataSourceType === "file" && file?.status !== ValueStatus.Available) {
            return hookResult("loading");
        }

        const originalUrl = dataSourceType === "file" ? file?.value?.uri ?? "" : externalUri;
        const [error, url] = getPreviewUrl(originalUrl);

        if (error) {
            return hookResult("error", `${error}`);
        }

        return hookResult("ok", `${url}`);
    }, [file, dataSourceType, externalUri]);
}
