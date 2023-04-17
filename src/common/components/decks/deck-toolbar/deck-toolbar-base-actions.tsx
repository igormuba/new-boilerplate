import { bellSvg, rocketSvg } from "../../../img/svg";
import React from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { WalletBadge } from "../../user-nav";
import { Dropdown } from "react-bootstrap";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import { dotsMenuIconSvg, notificationsIconSvg, walletIconSvg } from "../icons";
import { _t } from "../../../i18n";

interface Props {
  isExpanded: boolean;
  setShowPurchaseDialog: (v: boolean) => void;
}

export const DeckToolbarBaseActions = ({ setShowPurchaseDialog, isExpanded }: Props) => {
  const { activeUser, global, toggleUIProp, notifications, dynamicProps } = useMappedStore();

  return activeUser ? (
    <div className="base-actions">
      {global.usePrivate && (
        <div className="notifications" onClick={() => toggleUIProp("notifications")}>
          {notifications.unread > 0 && (
            <span className="notifications-badge notranslate">
              {notifications.unread.toString().length < 3 ? notifications.unread : "..."}
            </span>
          )}
          {bellSvg}
        </div>
      )}
      {global.usePrivate && <div onClick={() => setShowPurchaseDialog(true)}>{rocketSvg}</div>}
      <WalletBadge icon={walletIconSvg} activeUser={activeUser} dynamicProps={dynamicProps} />
      {isExpanded ? (
        <Dropdown>
          <DropdownToggle variant="link">{dotsMenuIconSvg}</DropdownToggle>
          <Dropdown.Menu alignRight={true}>
            <Dropdown.Item href="/">{_t("decks.back-to-feed")}</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item href="/faq">{_t("decks.faq")}</Dropdown.Item>
            <Dropdown.Item href="/terms-of-service">{_t("decks.terms")}</Dropdown.Item>
            <Dropdown.Item href="/market">{_t("decks.market")}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  );
};
