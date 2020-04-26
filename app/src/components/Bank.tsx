import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Melvor from '../melvor';

const typedKeys: { <T>(o: T): Array<keyof T> } = Object.keys as any;

export default class Bank extends Component {
    renderTarget = document.querySelector('#bank-container > div > div:nth-child(2)')!;
    consumeInterval?: NodeJS.Timeout;

    render() {
        return ReactDOM.createPortal(
            <button type="button" className="btn btn-lg btn-info ml-2" onClick={this.onConsumeTokens.bind(this)}>
                Consume Mastery Tokens
            </button>,
            this.renderTarget
        );
    }

    clearConsumeInterval() {
        if (this.consumeInterval) {
            clearInterval(this.consumeInterval);
            this.consumeInterval = undefined;
        }
    }

    onConsumeInterval() {
        // Find mastery token in bank
        const bankId = typedKeys(Melvor.bank).find((bankId) => Melvor.bank[bankId].category === 'Mastery');
        if (bankId === undefined) {
            // No mastery tokens found
            this.clearConsumeInterval();
            return;
        }

        const itemId = Melvor.bank[bankId].id;
        Melvor.claimToken(bankId, itemId);
    }

    onConsumeTokens() {
        if (this.consumeInterval) {
            this.clearConsumeInterval();
            return;
        }

        // Try to claim a token every 250ms
        this.consumeInterval = setInterval(this.onConsumeInterval.bind(this), 250);
        this.onConsumeInterval();
    }
}
