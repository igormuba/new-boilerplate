import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { _t } from "../../i18n";
import { swapSvg, syncSvg } from "../../img/svg";
import { SwapAmountControl } from "./swap-amount-control";
import { MarketInfo } from "./market-info";
import { MarketAsset, MarketPairs } from "./market-pair";
import { ActiveUser } from "../../store/active-user/types";
import { getBalance } from "./api/get-balance";
import { getMarketRate } from "./api/get-market-rate";
import { getCGMarket } from "./api/coingecko-api";

interface Props {
  activeUser: ActiveUser | null;
}

export const MarketSwapForm = ({ activeUser }: Props) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [fromAsset, setFromAsset] = useState(MarketAsset.HIVE);
  const [toAsset, setToAsset] = useState(MarketAsset.HBD);

  const [balance, setBalance] = useState("");

  const [marketRate, setMarketRate] = useState(0);
  const [usdFromMarketRate, setUsdFromMarketRate] = useState(0);
  const [usdToMarketRate, setUsdToMarketRate] = useState(0);

  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<MarketAsset[]>([]);

  let interval: any;

  useEffect(() => {
    fetchMarket();
    // interval = setInterval(() => fetchMarket(), 20000);
    return () => {
      // clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (activeUser) setBalance(getBalance(fromAsset, activeUser));
  }, [activeUser]);

  useEffect(() => {
    const nextAvailableAssets = MarketPairs[toAsset].filter((asset) => asset !== fromAsset);
    if (!nextAvailableAssets.includes(toAsset)) {
      setToAsset(nextAvailableAssets[0]);
      fetchMarket();
    }

    setAvailableAssets(nextAvailableAssets);
    if (activeUser) setBalance(getBalance(fromAsset, activeUser));
  }, [fromAsset]);

  const swap = () => {
    setFromAsset(toAsset);
    setTo(from);
    setFrom(to);
    setUsdFromMarketRate(usdToMarketRate);
    setUsdToMarketRate(usdFromMarketRate);
  };

  const fetchMarket = async () => {
    setDisabled(true);
    setMarketRate(await getMarketRate(fromAsset));
    setDisabled(false);

    const [fromUsdRate, toUsdRate] = await getCGMarket(fromAsset, toAsset);
    setUsdFromMarketRate(fromUsdRate);
    setUsdToMarketRate(toUsdRate);
  };

  return (
    <div className="market-swap-form p-4">
      <div className="d-flex align-items-center title mb-4">
        <div className="text-primary font-weight-bold">{_t("market.swap-title")}</div>
        {disabled ? <i className="loading-market-svg ml-2 text-primary">{syncSvg}</i> : <></>}
      </div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <SwapAmountControl
          asset={fromAsset}
          balance={balance}
          availableAssets={MarketPairs[fromAsset]}
          labelKey="market.from"
          value={from}
          setValue={(v) => {
            setFrom(v);
            setTo(marketRate * +v.replace(/,/gm, "") + "");
          }}
          setAsset={(v) => setFromAsset(v)}
          usdRate={usdFromMarketRate}
        />
        <div className="swap-button-container">
          <div className="overlay">
            <Button variant="" className="swap-button border" onClick={swap}>
              {swapSvg}
            </Button>
          </div>
        </div>
        <SwapAmountControl
          asset={toAsset}
          availableAssets={availableAssets}
          labelKey="market.to"
          value={to}
          setValue={(v) => {
            setTo(v);
            setFrom(+v.replace(/,/gm, "") / marketRate + "");
          }}
          setAsset={(v) => setToAsset(v)}
          usdRate={usdToMarketRate}
        />
        <MarketInfo
          className="mt-4"
          marketRate={marketRate}
          toAsset={toAsset}
          fromAsset={fromAsset}
          usdFromMarketRate={usdFromMarketRate}
        />
        <Button block={true} type="submit" disabled={disabled || loading} className="py-3 mt-4">
          {loading ? _t("market.swapping") : _t("market.continue")}
        </Button>
      </Form>
    </div>
  );
};
