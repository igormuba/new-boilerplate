import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React, { useEffect, useState } from "react";
import { _t } from "../../i18n";
import { OrdersData, OrdersDataItem } from "../../api/hive";
import { MarketAsset } from "../market-swap-form/market-pair";
import formattedNumber from "../../util/formatted-number";
import { StakeWidgetHeaderOptions, StakeWidgetViewType } from "./stake-widget-header-options";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { History } from "history";

interface Props {
  browserHistory: History;
  history: OrdersData | null;
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
}

interface StakeItem {
  price: number;
  amount: number;
  total: number;
}

export const StakeWidget = ({ history, fromAsset, toAsset, browserHistory }: Props) => {
  const [sells, setSells] = useState<StakeItem[]>([]);
  const [maxSell, setMaxSell] = useState(0);
  const [buys, setBuys] = useState<StakeItem[]>([]);
  const [maxBuy, setMaxBuy] = useState(0);
  const [fraction, setFraction] = useState(0.00001);
  const [viewType, setViewType] = useState(StakeWidgetViewType.All);

  const rowsCount = 17;

  useEffect(() => {
    buildAllStakeItems(fraction);
  }, [history]);

  const buildAllStakeItems = (fraction: number, unlimited?: boolean) => {
    if (!history) return;

    let sells = buildStakeItems(history.asks, "desc", fraction);
    if (!unlimited) sells = sells.slice(sells.length - 1 - rowsCount, sells.length);
    setSells(sells);
    setMaxSell(Math.min(5000, Math.max(...sells.map((i) => i.amount))));

    let buys = buildStakeItems(history.bids, "desc", fraction);
    if (!unlimited) buys = buys.slice(0, rowsCount);
    setBuys(buys);
    setMaxBuy(Math.min(5000, Math.max(...buys.map((i) => i.amount))));
  };

  const buildStakeItems = (
    h: OrdersDataItem[],
    sort: "asc" | "desc",
    fraction: number
  ): StakeItem[] =>
    Array.from(
      h
        // Group order items by fractions
        .reduce<Map<number, OrdersDataItem[]>>((acc, item) => {
          const price = item.hbd / 1000 / (item.hive / 1000);
          const priceWithFraction = getPriceWithFraction(price, fraction);
          if (acc.has(priceWithFraction)) {
            const values = acc.get(priceWithFraction)!;
            values.push(item);
            acc.set(priceWithFraction, values);
          } else {
            acc.set(priceWithFraction, [item]);
          }
          return acc;
        }, new Map())
        .entries()
    )
      .map(([price, items]) => ({
        // Calculate total amount inside one group
        amount: items.reduce((acc, item) => acc + item.hive / 1000, 0),
        price: price,
        // Calculate total funds inside one group
        total: items.reduce((acc, item) => acc + (item.hbd / 1000) * (item.hive / 1000), 0)
      }))
      .sort((a, b) => (sort === "desc" ? b.price - a.price : a.price - b.price));

  const getPriceWithFraction = (price: number, fraction: number): number => {
    if (fraction === 0.00001) return +price.toFixed(5);
    if (fraction === 0.0001) return +price.toFixed(4);
    if (fraction === 0.001) return +price.toFixed(3);
    if (fraction === 0.01) return +price.toFixed(2);
    if (fraction === 0.1) return +price.toFixed(1);
    return +price.toFixed(0);
  };

  return (
    <MarketAdvancedModeWidget
      history={browserHistory}
      type={Widget.Stake}
      className="market-advanced-mode-stake-widget"
      headerOptions={
        <StakeWidgetHeaderOptions
          fraction={fraction}
          onFractionChange={(value) => {
            setFraction(value);
            buildAllStakeItems(value);
          }}
          viewType={viewType}
          onViewTypeChange={(value) => {
            setViewType(value);
            if (value !== viewType) buildAllStakeItems(fraction, value !== StakeWidgetViewType.All);
          }}
        />
      }
      children={
        <div className="market-stake-widget">
          <div className="market-stake-widget-sell">
            <div className="market-stake-widget-content history-widget-content">
              <div className="history-widget-row history-widget-header">
                <div>
                  {_t("market.advanced.history-widget.price")}({toAsset})
                </div>
                <div>
                  {_t("market.advanced.history-widget.amount")}({fromAsset})
                </div>
                <div>{_t("market.advanced.history-widget.time")}</div>
              </div>
              <div>
                {[StakeWidgetViewType.All, StakeWidgetViewType.Sell].includes(viewType) &&
                  sells.map((sell, key) => (
                    <div className="history-widget-row sell" key={key}>
                      <div
                        className="history-widget-row-progress"
                        style={{ width: (sell.amount / maxSell) * 100 + "%" }}
                      />
                      <div className="text-danger">{sell.price}</div>
                      <div>{sell.amount.toFixed(2)}</div>
                      <div>{formattedNumber(sell.total, { fractionDigits: 2 })}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="market-stake-widget-buy">
            <div className="market-stake-widget-sell history-widget-content">
              <div>
                {[StakeWidgetViewType.All, StakeWidgetViewType.Buy].includes(viewType) &&
                  buys.map((buy, key) => (
                    <div className="history-widget-row buy" key={key}>
                      <div
                        className="history-widget-row-progress"
                        style={{ width: (buy.amount / maxBuy) * 100 + "%" }}
                      />
                      <div className="text-success">{buy.price}</div>
                      <div>{buy.amount.toFixed(2)}</div>
                      <div>{formattedNumber(buy.total, { fractionDigits: 2 })}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      }
      widgetTypeChanged={() => {}}
    />
  );
};
