import React, { Component } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    title: string;
    border?: string;
    image?: string;
}
export default class Modal extends Component<ModalProps> {
    modalRef = React.createRef<HTMLDivElement>();
    renderTarget = document.createElement('div');

    componentDidMount() {
        document.body.appendChild(this.renderTarget);
    }

    componentWillUnmount() {
        this.hide();
        document.body.removeChild(this.renderTarget);
    }

    show() {
        if (this.modalRef.current) {
            $(this.modalRef.current).modal('show');
        }
    }

    hide() {
        if (this.modalRef.current) {
            $(this.modalRef.current).modal('hide');
        }
    }

    render() {
        let image;
        if (this.props.image) {
            image = <img className="mastery-icon-xs mr-2" src={this.props.image} />;
        }

        let border;
        if (this.props.border) {
            border = `border-${this.props.border}`;
        }

        return ReactDOM.createPortal(
            <div ref={this.modalRef} className="modal" tabIndex={-1} role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className={'block block-rounded block-link-pop border-top border-4x ' + border}>
                            <div className="block-header">
                                <h3 className="block-title">
                                    {image}
                                    {this.props.title}
                                </h3>
                                <div className="block-options">
                                    <button
                                        type="button"
                                        className="btn-block-option"
                                        data-dismiss="modal"
                                        aria-label="Close"
                                    >
                                        <i className="fa fa-fw fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="block-content">{this.props.children}</div>
                        </div>
                    </div>
                </div>
            </div>,
            this.renderTarget
        );
    }
}
