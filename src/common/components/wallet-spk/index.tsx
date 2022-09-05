import React, { Component } from 'react';
import WalletMenu from '../wallet-menu';
import { Global } from '../../store/global/types';
import { Account } from '../../store/accounts/types';
import { _t } from '../../i18n';
import { getSpkWallet } from '../../api/spk-api';
import { WalletSpkSection } from './wallet-spk-section';
import { SendSpkDialog } from './send-spk-dialog';
import { ActiveUser } from '../../store/active-user/types';
import { Button } from 'react-bootstrap';

interface Props {
  global: Global;
  account: Account;
  activeUser: ActiveUser | null;
  addAccount: (account: Account) => void;
  updateActiveUser: (account: Account) => void;
}

interface State {
  tokenBalance: number;
  larynxAirBalance: number;
  larynxTokenBalance: number;
  larynxPowerBalance: number;
  estimatedBalance: number;
  sendSpkShow: boolean;
}

class WalletSpk extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      tokenBalance: 0,
      larynxAirBalance: 0,
      larynxPowerBalance: 0,
      larynxTokenBalance: 0,
      estimatedBalance: 0,
      sendSpkShow: false
    };
  }

  componentDidMount() {
    this.fetch();
  }

  async fetch() {
    try {
      const wallet = await getSpkWallet(this.props.account.name);
      this.setState({
        tokenBalance: wallet.spk,
        larynxAirBalance: wallet.drop.availible.amount / 1000,
        larynxTokenBalance: wallet.balance,
        larynxPowerBalance: wallet.poweredUp,
        estimatedBalance: wallet.balance
      })
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    return <div className="wallet-hive">
      <div className="wallet-main">
        <div className="wallet-info">
          <WalletSpkSection
            {...this.props}
            title={_t("wallet.spk.token")}
            description={_t("wallet.spk.token-description")}
            amountSlot={<>{this.state.tokenBalance} SPK</>}
            actionSlot={<Button
              variant={'primary'}
              onClick={() => this.setState({ sendSpkShow: true })}
            >{_t('wallet.spk.send.button')}</Button>}
          />
          <WalletSpkSection
            {...this.props}
            isAlternative={true}
            title={_t("wallet.spk.larynx-air")}
            description={_t("wallet.spk.larynx-air-description")}
            slot={<div className="warning">{_t("wallet.spk.larynx-air-warning")}</div>}
            amountSlot={<>{this.state.larynxAirBalance} LARYNX</>}
          />
          <WalletSpkSection
            {...this.props}
            title={_t("wallet.spk.larynx-token")}
            description={_t("wallet.spk.larynx-token-description")}
            amountSlot={<>{this.state.larynxTokenBalance} LARYNX</>}
          />
          <WalletSpkSection
            {...this.props}
            isAlternative={true}
            title={_t("wallet.spk.larynx-power")}
            description={_t("wallet.spk.larynx-power-description")}
            slot={<div className="menu">
              <p>{_t("wallet.spk.larynx-power-benefits.title")}</p>
              <ul>
                <li>{_t("wallet.spk.larynx-power-benefits.1")}</li>
                <li>{_t("wallet.spk.larynx-power-benefits.2")}</li>
                <li>{_t("wallet.spk.larynx-power-benefits.3")}</li>
                <li>{_t("wallet.spk.larynx-power-benefits.4")}</li>
                <li>{_t("wallet.spk.larynx-power-benefits.5")}</li>
              </ul>
            </div>}
            amountSlot={<>{this.state.larynxPowerBalance} LP</>}
          />
          <WalletSpkSection
            {...this.props}
            title={_t("wallet.spk.account-value")}
            description={_t("wallet.spk.account-value-description")}
            amountSlot={<>${this.state.estimatedBalance}</>}
          />
        </div>
        <WalletMenu global={this.props.global} username={this.props.account.name} active="spk"/>
      </div>

      <SendSpkDialog
        global={this.props.global}
        account={this.props.account}
        show={this.state.sendSpkShow}
        setShow={(v: boolean) => this.setState({ sendSpkShow: v })}
        activeUser={this.props.activeUser}
        balance={this.state.tokenBalance}
        addAccount={this.props.addAccount}
        updateActiveUser={this.props.updateActiveUser}
        onFinish={() => this.fetch()}
      />
    </div>
  }
}

export default (props: Props) => {
  return <WalletSpk {...props} />
}