import React, {Component} from "react";

import {History} from "history";

import {Form, Modal} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {ActiveUser} from "../../store/active-user/types";

import BaseComponent from "../base";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import Tooltip from "../tooltip";
import KeyOrHotDialog from "../key-or-hot-dialog";
import {error} from "../feedback";

import {DelegatedVestingShare, getVestingDelegations} from "../../api/hive";

import {
    delegateVestingShares,
    delegateVestingSharesHot,
    delegateVestingSharesKc,
    formatError
} from "../../api/operations";

import {_t} from "../../i18n";

import {vestsToHp} from "../../helper/vesting";

import parseAsset from "../../helper/parse-asset";

import formattedNumber from "../../util/formatted-number";

import _c from "../../util/fix-class-names";

interface Props {
    history: History;
    global: Global;
    activeUser: ActiveUser | null;
    account: Account;
    dynamicProps: DynamicProps;
    signingKey: string;
    addAccount: (data: Account) => void;
    setSigningKey: (key: string) => void;
    onHide: () => void;
    searchText: string;
}

interface State {
    loading: boolean;
    inProgress: boolean;
    data: DelegatedVestingShare[];
    searchData: DelegatedVestingShare[];
    hideList: boolean;
}

export class List extends BaseComponent<Props, State> {
    state: State = {
        loading: false,
        inProgress: false,
        data: [],
        searchData: [],
        hideList: false
    };

    componentDidMount() {
        this.fetch().then();
    }

    fetch = () => {
        const {account} = this.props;
        this.stateSet({loading: true});
        let totalData: DelegatedVestingShare[] = [];
        let getData = (account:string, start:string, limit:number) => {
            return getVestingDelegations(account, start, limit)
                .then((r) => {
                    totalData = totalData.concat(r);
                    if(r.length === limit){
                        getData(account, r[limit-1].delegatee, limit)
                    }
                    else {
                        const sorted: DelegatedVestingShare[] = totalData.sort((a, b) => {
                            return parseAsset(b.vesting_shares).amount - parseAsset(a.vesting_shares).amount;
                        });
                        this.stateSet({loading: false, data: [... new Set(sorted)]})
                    }
                });
        }

        return getData(account.name, "", 1000);
    }

    componentDidUpdate(prevProps: Props){
        if(prevProps.searchText !== this.props.searchText && this.props.searchText && this.props.searchText.length > 0){
            let filteredItems = this.state.data.filter(item => 
                item.delegatee.toLocaleLowerCase().includes(this.props.searchText!.toLocaleLowerCase()));
                debugger
            this.setState({ searchData: filteredItems });
        }
    }

    render() {
        const {loading, data, hideList, inProgress, searchData} = this.state;
        const {dynamicProps, activeUser, account, searchText} = this.props;
        const {hivePerMVests} = dynamicProps;

        if (loading) {
            return (<div className="delegated-vesting-content">
                <LinearProgress/>
            </div>);
        }

        let dataToShow = searchText.length > 0 ? searchData : data;

        return (
            <div className={_c(`delegated-vesting-content ${inProgress ? "in-progress" : ""} ${hideList ? "hidden" : ""}`)}>
                <div className="user-list">
                    <div className="list-body">
                        {dataToShow.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
                        {dataToShow.map(x => {
                            const vestingShares = parseAsset(x.vesting_shares).amount;
                            const {delegatee: username} = x;

                            const deleteBtn = (activeUser && activeUser.username === account.name) ? KeyOrHotDialog({
                                ...this.props,
                                activeUser: activeUser,
                                children: <a href="#" className="undelegate">{_t("delegated-vesting.undelegate")}</a>,
                                onToggle: () => {
                                    const {hideList} = this.state;
                                    this.stateSet({hideList: !hideList});
                                },
                                onKey: (key) => {
                                    this.stateSet({inProgress: true});
                                    delegateVestingShares(activeUser.username, key, username, "0.000000 VESTS")
                                        .then(() => this.fetch())
                                        .catch(err => error(formatError(err)))
                                        .finally(() => this.stateSet({inProgress: false}))
                                },
                                onHot: () => {
                                    delegateVestingSharesHot(activeUser.username, username, "0.000000 VESTS");
                                },
                                onKc: () => {
                                    this.stateSet({inProgress: true});
                                    delegateVestingSharesKc(activeUser.username, username, "0.000000 VESTS")
                                        .then(() => this.fetch())
                                        .catch(err => error(formatError(err)))
                                        .finally(() => this.stateSet({inProgress: false}))
                                }
                            }) : null;

                            return <div className="list-item" key={username}>
                                <div className="item-main">
                                    {ProfileLink({
                                        ...this.props,
                                        username,
                                        children: <>{UserAvatar({...this.props, username: x.delegatee, size: "small"})}</>
                                    })}
                                    <div className="item-info">
                                        {ProfileLink({
                                            ...this.props,
                                            username,
                                            children: <a className="item-name notransalte">{username}</a>
                                        })}
                                    </div>
                                </div>
                                <div className="item-extra">
                                    <Tooltip content={x.vesting_shares}>
                                        <span>{formattedNumber(vestsToHp(vestingShares, hivePerMVests), {suffix: "HP"})}</span>
                                    </Tooltip>
                                    {deleteBtn}
                                </div>
                            </div>;
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

interface DelegatedVestingState {
    searchText: string;
}


export default class DelegatedVesting extends Component<Props, DelegatedVestingState> {
    constructor(props: Props){
        super(props);
        this.state = {
            searchText: ''
        }
    }

    render() {
        const {onHide} = this.props;
        const {searchText} = this.state;

        return (
            <>
                <Modal onHide={onHide} show={true} centered={true} animation={false}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{_t("delegated-vesting.title")}</Modal.Title>
                    </Modal.Header>

                    <Form.Group className="w-100 px-3">
                        <Form.Control
                            type="text" 
                            placeholder={_t('friends.search-placeholder')} 
                            value={searchText} 
                            onChange={(e) => {
                                let text = e.target.value
                            this.setState({ searchText: e.target.value });
                            }}
                        />
                    </Form.Group>
                    <Modal.Body>
                        <List {...this.props} searchText={searchText} />
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}
