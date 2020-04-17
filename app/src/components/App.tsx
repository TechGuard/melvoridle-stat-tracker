import React, { Component } from 'react';
import { TrackedObject, ObjectType, TrackedObjectList } from './TrackedObject';

interface AppState {
    trackedObjects: TrackedObject[];
    visible: boolean;
}

export default class App extends Component<{}, AppState> {
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            trackedObjects: [],
            visible: false,
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

    render() {
        let objectList = null;
        if (this.state.visible) {
            objectList = <TrackedObjectList key="list" trackedObjects={this.state.trackedObjects} />;
        }
        return [
            <div key="app" className="nav-main-heading">
                Statistics Tracker
                <i
                    onClick={this.toggleVisibility.bind(this)}
                    className={`far ${this.state.visible ? 'fa-eye' : 'fa-eye-slash'} text-muted ml-1`}
                    style={{ cursor: 'pointer', paddingLeft: '3px' }}
                />
                <i
                    onClick={this.reset.bind(this)}
                    className="fas fa-undo-alt text-muted ml-1"
                    style={{ cursor: 'pointer', paddingLeft: '3px' }}
                />
            </div>,
            objectList,
        ];
    }
}
