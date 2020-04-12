import React, { Component } from 'react';
import { TrackedObject, ObjectType, TrackedSkill, TrackedItem } from './TrackedObject';

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

        // Ignore first object
        const object = this.state.trackedObjects.find((o) => o.type === type && o.id === id);
        if (object === undefined) {
            this.setState((prevState) => ({
                trackedObjects: prevState.trackedObjects.concat([
                    {
                        type: type,
                        key: `${type}-${id}`,
                        id: id,
                        value: 0,
                        lastTime: timestamp,
                    },
                ]),
            }));
            return;
        }

        const newObject = {} as TrackedObject;
        const timeDiff = (timestamp - object.lastTime) / 1000;
        const newValue = value / timeDiff;
        newObject.lastTime = timestamp;

        if (object.value === 0) {
            newObject.value = newValue;
        } else if (timeDiff > 0) {
            // smoothed moving average
            const N = 10;
            newObject.value = ((N - 1.0) * object.value + newValue) / N;
        }

        // Update state
        this.setState((prevState) => ({
            trackedObjects: prevState.trackedObjects.map((o) => (o.key === object.key ? { ...o, ...newObject } : o)),
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
        ].concat(
            this.state.trackedObjects
                .slice()
                .sort((a, b) => b.lastTime - a.lastTime)
                .map((o) => {
                    switch (o.type) {
                        case 'skill':
                            return React.createElement(TrackedSkill, o);
                        case 'item':
                            return React.createElement(TrackedItem, o);
                    }
                })
        );
    }
}
