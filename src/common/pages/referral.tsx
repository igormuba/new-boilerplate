import React from "react";

import {connect} from "react-redux";

import BaseComponent from "../components/base";
import Meta from "../components/meta";
import Feedback from "../components/feedback";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";
import ProfileLink from "../components/profile-link";
import UserAvatar from "../components/user-avatar";
import EntryLink from "../components/entry-link";


import {_t} from "../i18n";
import {Tsx} from "../i18n/helper";

import {linkSvg, openInNewSvg} from "../img/svg";

import {pageMapDispatchToProps, pageMapStateToProps, PageProps} from "./common";



interface State {
    referrals: [];
    proxy: string | null;
    loading: boolean;
}

class ReferralPage extends BaseComponent<PageProps, State> {
    state: State = {
        referrals: [],
        proxy: null,
        loading: true
    }

    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<State>, snapshot?: any) {
        // active user changed
        if (this.props.activeUser?.username !== prevProps.activeUser?.username) {
            this.stateSet({loading: true}, () => {
                this.load();
            })
        }
    }

    load = async () => {
        this.stateSet({loading: true});

        const {activeUser} = this.props;
        

        const referrals:[] = []
        await this.getReferrals(referrals);
    }

    getReferrals = async (referralArray:[])=>{
        try {
           // Fetch referrals
           console.log('Getting Referrals')
            
        } catch (error) {
            console.log('Something went wrong: ',error)
        }
    }

    render() {
        //  Meta config
        const metaProps = {
            title: _t("referral.page-title"),
            description: _t("referral.page-description"),
        };

        const {global, activeUser} = this.props;
        const {referrals, loading, proxy} = this.state;

        const table = <><table className="table d-none d-sm-block">
            <thead>
            <tr>
                <th className="col-rank">
                    {_t("referral.list-rank")}
                </th>
                <th>
                    {_t("referral.list-referral")}
                </th>
                <th className="col-miss">
                    {_t("referral.list-miss")}
                </th>
                <th className="col-url">
                    {_t("referral.list-url")}
                </th>
                <th className="col-fee">
                    {_t("referral.list-fee")}
                </th>
                <th className="col-feed">
                    {_t("referral.list-feed")}
                </th>
                <th className="col-version">
                    {_t("referral.list-version")}
                </th>
            </tr>
            </thead>
            <tbody>
            {referrals.map((row, i) => {
                return <tr key={i}>
                    <td>
                        <div className="witness-rank">
                            <span className="rank-number">{'row.rank'}</span>
                            $$
                        </div>
                    </td>
                    <td>
                        {ProfileLink({
                            ...this.props,
                            username: 'adesojisouljay',
                            children: <span className="witness-card notranslate"> {UserAvatar({
                                ...this.props,
                                username: 'adesojisouljay',
                                size: "medium"
                            })}
                                <div className={'witness-ctn'}>
                                  Referral   {i + 1}
                                </div>
                            </span>
                        })}
                    </td>
                    {/* To user profile */}
                    <td>
                        {(() => {
                            const {parsedUrl} = row;

                            if (parsedUrl) {
                                return (
                                    <EntryLink {...this.props} entry={parsedUrl}>
                                        <span className="witness-link">{linkSvg}</span>
                                    </EntryLink>
                                );
                            }

                            return (
                                <a target="_external" href={'http/localhost:3000/referrals'} className="witness-link">{openInNewSvg}</a>
                            );
                        })()}
                    </td>
                </tr>
            })}
            </tbody>
        </table>
        <div className="d-md-none">
        {/* Mobile Screen */}
        {/* {referrals.map((row, i) => {
            return <ReferralCard
                    referral={row.name}
                    row={row}
                    key={i}
                    global={global}
                    />
        })} */}
        </div>
        </>;

        const header = <div className="page-header mt-5">
            <div className="header-title">
                {_t('referral.page-title')}
            </div>
            <Tsx k="referral.page-description-long"><div className="header-description" /></Tsx>
        </div>;
        let containerClasses = global.isElectron ? " mt-0 pt-6" : "";

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                        reloadFn: this.load,
                        reloading: loading,
                    }) :
                    NavBar({...this.props})}
                <div className={"app-content witnesses-page" + containerClasses}>
                    {(() => {
                        if (loading) {
                            return <>
                                {header}
                                <LinearProgress/>
                            </>
                        }

                        return <>
                            {header}
                            <div className="table-responsive witnesses-table">{table}</div>
                        </>
                    })()}
                </div>
            </>
        );
    }
}


export default connect(pageMapStateToProps, pageMapDispatchToProps)(ReferralPage);
