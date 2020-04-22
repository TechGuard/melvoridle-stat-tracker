import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Melvor from '../melvor';

export default class Bank extends Component {
    renderTarget = document.querySelector('#bank-container > div > div:nth-child(2)')!;

    render() {
        return ReactDOM.createPortal(
            <button type="button" className="btn btn-lg btn-info ml-2" onClick={this.onConsumeTokens}>
                Consume Mastery Tokens
            </button>,
            this.renderTarget
        );
    }

    onConsumeTokens() {
        for (const id in Melvor.bank) {
            const item = Melvor.bank[id];

            if (item.category === 'Mastery') {
                Melvor.claimToken(id, item.id, true);
            }
        }
    }
}
