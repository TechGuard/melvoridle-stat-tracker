import React, { Component, ChangeEventHandler, ReactNode } from 'react';
import Modal from './Modal';

export interface SettingsState {
    groupCommonItems: boolean;
    showHiddenItems: boolean;
    displayGoldHr: 'default' | 'always' | 'never';
}

type EditableSettingsState = SettingsState & {
    setState: (state: Partial<SettingsState>) => void;
};

const DEFAULT_SETTINGS: SettingsState = {
    groupCommonItems: true,
    showHiddenItems: false,
    displayGoldHr: 'default',
};

export const SettingsContext = React.createContext<SettingsState>(DEFAULT_SETTINGS);

// Takes care of loading and saving settings data and exposing the settings to all other components.
export class SettingsProvider extends Component<{}, EditableSettingsState> {
    constructor(props: Readonly<{}>) {
        super(props);

        // Load from storage
        const storageData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        this.state = Object.assign(
            {
                setState: this.setState.bind(this),
            },
            DEFAULT_SETTINGS,
            storageData
        );
    }

    componentDidUpdate(_prevProps: any, prevState: SettingsState) {
        // Save to storage when state changes
        if (prevState !== this.state) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
    }

    render() {
        return <SettingsContext.Provider value={this.state}>{this.props.children}</SettingsContext.Provider>;
    }
}

export class Settings extends Component {
    static contextType = SettingsContext;

    modalRef = React.createRef<Modal>();
    innerRef = React.createRef<HTMLDivElement>();

    constructor(props: Readonly<{}>) {
        super(props);
    }

    componentDidMount() {
        // Create tooltips
        if (this.innerRef.current) {
            $(this.innerRef.current).find('[data-toggle="tooltip"]').tooltip({
                sanitize: false,
            });
        }
    }

    open() {
        if (this.modalRef.current) {
            this.modalRef.current.show();
        }
    }

    static FormRow(props: { label?: string; tooltip?: string; centerLabel?: boolean; children?: ReactNode }) {
        const centerLabelClass = props.centerLabel ? 'col-form-label' : '';
        let tooltipProps;
        if (props.tooltip) {
            tooltipProps = {
                'data-toggle': 'tooltip',
                'data-placement': 'bottom',
                title: props.tooltip,
            };
        }

        return (
            <div className="row">
                <div className="col-sm-5">
                    <p className={'font-size-sm text-muted ' + centerLabelClass} {...tooltipProps}>
                        {props.label}
                    </p>
                </div>
                <div className="col-sm-7">{props.children}</div>
            </div>
        );
    }

    static FormInputRadio(props: { label?: string; value?: boolean; onChange?: ChangeEventHandler }) {
        const [id] = React.useState(Math.random().toString(36).substring(5));
        return (
            <div className="custom-control custom-radio custom-control-inline custom-control-lg">
                <input
                    id={id}
                    type="radio"
                    checked={props.value}
                    onChange={props.onChange}
                    className="custom-control-input"
                />
                <label className="custom-control-label" htmlFor={id}>
                    {props.label}
                </label>
            </div>
        );
    }

    static FormInputBool(props: { value?: boolean; onChange?: (value: boolean) => void }): any {
        return [
            <Settings.FormInputRadio
                key="enable"
                label="Enable"
                value={props.value}
                onChange={() => props.onChange && props.onChange(true)}
            />,
            <Settings.FormInputRadio
                key="disable"
                label="Disable"
                value={!props.value}
                onChange={() => props.onChange && props.onChange(false)}
            />,
        ];
    }

    render() {
        const settings: EditableSettingsState = this.context;
        return (
            <Modal
                ref={this.modalRef}
                title={`Stat Tracker - ${__npm_package_version__}`}
                image="assets/media/main/settings_header.svg"
                border="settings"
            >
                <div ref={this.innerRef}>
                    <Settings.FormRow
                        label="Group common items"
                        tooltip="Group stats for common items, ie: fishing junk and gems."
                    >
                        <Settings.FormInputBool
                            value={settings.groupCommonItems}
                            onChange={(value) => settings.setState({ groupCommonItems: value })}
                        />
                    </Settings.FormRow>
                    <Settings.FormRow
                        label="Show hidden items"
                        tooltip="Some items are hidden, ie: mastery tokens and burnt fish. If enabled these items are shown again."
                    >
                        <Settings.FormInputBool
                            value={settings.showHiddenItems}
                            onChange={(value) => settings.setState({ showHiddenItems: value })}
                        />
                    </Settings.FormRow>
                    <Settings.FormRow
                        centerLabel={true}
                        label="Display total gold/hr"
                        tooltip="Default behaviour is to only show total gold/hr when multiple items are being tracked."
                    >
                        <select
                            className="custom-select"
                            value={settings.displayGoldHr}
                            onChange={(ev) => settings.setState({ displayGoldHr: ev.target.value as any })}
                        >
                            <option value="default">Default</option>
                            <option value="always">Always</option>
                            <option value="never">Never</option>
                        </select>
                    </Settings.FormRow>
                </div>
            </Modal>
        );
    }
}

declare var __npm_package_version__: string;

const STORAGE_KEY = '__statTrackerSettings';
