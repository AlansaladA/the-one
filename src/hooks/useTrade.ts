import { useDispatch, useSelector } from "react-redux";
import { setSocketData, setAddressData } from "@/store/tradeSlice";
import { StoreType } from "@/store";
import { TweetData, AddressData } from "@/utils/types";



export const useTrade = () => {
  const dispatch = useDispatch();
  const trade = useSelector((state: StoreType) => state.trade);

  const updateTrade = (data:TweetData) => {
    dispatch(setSocketData(data));
  }

  const updateAddress = (data:AddressData) => {
    dispatch(setAddressData(data));
  }

  return {
    trade,
    updateTrade,
    updateAddress
  }
}