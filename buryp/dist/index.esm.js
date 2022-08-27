const createHistoryEvnent = (type) => {
    const origin = history[type];
    return function () {
        const res = origin.apply(this, arguments);
        var e = new Event(type);
        window.dispatchEvent(e);
        return res;
    };
};

const MouseEventList = [
    "click",
    "dblclick",
    "contextmenu",
    "mousedown",
    "mouseup",
    "mouseenter",
    "mouseout",
    "mouseover",
];
class Tracker {
    constructor(options) {
        this.data = Object.assign(this.initDef(), options);
        this.installInnerTrack();
    }
    setUserId(uuid) {
        this.data.uuid = uuid;
    }
    setExtra(extra) {
        this.data.extra = extra;
    }
    sendTracker(data) {
        //用户手动上报
        this.reportTracker(data);
    }
    initDef() {
        //默认值用的
        // this.version = TrackerConfig.version;
        window.history["pushState"] = createHistoryEvnent("pushState");
        window.history["replaceState"] = createHistoryEvnent("replaceState");
        return {
            sdkVersion: this.version,
            historyTracker: false,
            hashTracker: false,
            domTracker: false,
            jsError: false,
        };
    }
    captureEvents(//自动上报
    MouseEventList, targetKey, data) {
        MouseEventList.forEach((event) => {
            window.addEventListener(event, () => {
                console.log("监听到了");
                this.reportTracker({ event, targetKey, data });
            });
        });
    }
    //dom 点击上报
    targetKeyReport() {
        MouseEventList.forEach((event) => {
            window.addEventListener(event, (e) => {
                const target = e.target;
                const targetValue = target.getAttribute("target-key");
                if (targetValue) {
                    this.sendTracker({
                        targetKey: targetValue,
                        event,
                    });
                }
            });
        });
    }
    installInnerTrack() {
        if (this.data.historyTracker) {
            this.captureEvents(["pushState"], "history-pv");
            this.captureEvents(["replaceState"], "history-pv");
            this.captureEvents(["popstate"], "history-pv");
        }
        if (this.data.hashTracker) {
            this.captureEvents(["hashchange"], "hash-pv");
        }
        if (this.data.domTracker) {
            this.targetKeyReport();
        }
        if (this.data.jsError) {
            this.jsError();
        }
    }
    //上报
    reportTracker(data) {
        const params = Object.assign(this.data, data, {
            time: new Date().getTime(),
        });
        let headers = {
            type: "application/x-www-form-urlencoded",
        };
        let blob = new Blob([JSON.stringify(params)], headers);
        navigator.sendBeacon(this.data.requestUrl, blob);
    }
    jsError() {
        //收集
        this.errorEvent();
        this.promiseReject();
    }
    //捕获js报错
    errorEvent() {
        window.addEventListener("error", (e) => {
            this.sendTracker({
                targetKey: "message",
                event: "error",
                message: e.message,
            });
        });
    }
    //捕获promise 错误
    promiseReject() {
        window.addEventListener("unhandledrejection", (event) => {
            event.promise.catch((error) => {
                this.sendTracker({
                    targetKey: "reject",
                    event: "promise",
                    message: error,
                });
            });
        });
    }
}

export { Tracker as default };
