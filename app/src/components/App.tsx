import React, { Component } from 'react';
import { TrackedObject, ObjectType, TrackedObjectList } from './TrackedObject';
import { Settings, SettingsProvider } from './Settings';
import styles from '../styles.scss';
import Bank from './Bank';

interface AppState {
    trackedObjects: TrackedObject[];
    visible: boolean;
}
export default class App extends Component<{}, AppState> {
    settingsRef = React.createRef<Settings>();
    bankRef = React.createRef<Bank>();

    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            trackedObjects: [],
            visible: true,
        };
    }

    trackObject(type: ObjectType, id: number, value: number) {
        const timestamp = new Date().getTime();
        const object: Readonly<TrackedObject> | undefined = this.state.trackedObjects.find(
            (o) => o.type === type && o.id === id
        );

        // Ignore first occurrence of object
        if (object === undefined) {
            this.setState((prevState) => ({
                trackedObjects: prevState.trackedObjects.concat({
                    type: type,
                    key: `${type}-${id}`,
                    id: id,
                    lastUpdated: 0,
                    valuePerSecond: 0,

                    // Keep track of 10 actions
                    values: Array(10).fill({ time: timestamp, value: 0 }),
                    valueIdx: 0,
                }),
            }));
            return;
        }

        // Update state
        this.setState((prevState) => ({
            trackedObjects: prevState.trackedObjects.map((o) => {
                if (o.key === object.key) {
                    // Update next value in circular-array
                    o.valueIdx = (o.valueIdx + 1) % o.values.length;
                    const beginTime = o.values[o.valueIdx].time;
                    o.values[o.valueIdx] = { time: timestamp, value: value };
                    o.lastUpdated = timestamp;

                    // smoothed moving average
                    const N = o.values.length;
                    const runningTime = (o.lastUpdated - beginTime) / 1000;
                    const valuePerSecond = o.values.map((o) => o.value).reduce((a, b) => a + b, 0) / runningTime;
                    o.valuePerSecond = ((N - 1.0) * o.valuePerSecond + valuePerSecond) / N;
                }
                return o;
            }),
        }));
    }

    reset() {
        this.setState({
            trackedObjects: [],
        });
    }

    toggleVisibility() {
        this.setState({
            visible: !this.state.visible,
        });
    }

    openSettings() {
        if (this.settingsRef.current) {
            this.settingsRef.current.open();
        }
    }

    render() {
        let visibilityIcon, objectList;

        if (this.state.visible) {
            visibilityIcon = 'fa-eye';
            objectList = <TrackedObjectList trackedObjects={this.state.trackedObjects} />;
        } else {
            visibilityIcon = 'fa-eye-slash';
        }

        return (
            <SettingsProvider>
                <Settings ref={this.settingsRef} />
                <Bank ref={this.bankRef} />
                <div className={'nav-main-heading ' + styles.navMainHeading}>
                    Stat Tracker
                    <i onClick={this.toggleVisibility.bind(this)} className={'far text-muted ' + visibilityIcon} />
                    <i onClick={this.reset.bind(this)} className="fas fa-undo-alt text-muted" />
                    <i onClick={this.openSettings.bind(this)} className="fas fa-cog text-muted" />
                </div>
                {objectList}
            </SettingsProvider>
        );
    }
}
