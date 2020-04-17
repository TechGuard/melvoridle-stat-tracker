import React, { Component } from 'react';
import { TrackedObject, ObjectType, TrackedObjectList } from './TrackedObject';

interface AppState {
    trackedObjects: TrackedObject[];
}

export default class App extends Component<{}, AppState> {
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            trackedObjects: [],
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

    render() {
        return [
            <div key="app" className="nav-main-heading">
                Statistics Tracker
                <a onClick={this.reset.bind(this)}>
                    <span className="fas fa-undo-alt text-muted ml-1" style={{ cursor: 'pointer' }} />
                </a>
            </div>,
            <TrackedObjectList key="list" trackedObjects={this.state.trackedObjects} />,
        ];
    }
}
