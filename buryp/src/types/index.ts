/**
 * @requestUrl 接口地址
 * @historyTracker history上报
 * @hashTracker hash上报
 * @domTracker 携带Tracker-key 点击事件上报
 * @historyTracker sdkVersion sdk版本
 * @historyTracker extra 透传字段
 * @jsError js 和 promise 报错异常上报
 */

export interface DefaultOptons {
  uuid: string | undefined; //UV
  requestUrl: string | undefined;
  historyTracker: boolean; //2种
  hashTracker: boolean;
  domTracker: boolean; //点击事件是否要上报
  sdkVersion: string | number;
  extra: Record<string, any> | undefined; //自定义参数是否要上报
  jsError: boolean; //错误是否要上报
}

//必传参数 requestUrl，其他都是非必传

export interface Options extends Partial<DefaultOptons> {
  requestUrl: string;
}

//版本

export enum TrackerConfig {
  version = "1.0.0",
}

//上报必传参数

export type reportTrackerData = {
  [key: string]: any;
  event: string;
  targetKey: string;
};
