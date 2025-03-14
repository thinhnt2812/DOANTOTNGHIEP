export interface Order {
  id: string;
  customername: string;
  customerphone: string;
  purchasedate: string;
  purchasedproduct: string;
  productcategory?: string;
  quantity: number;
  unitprice: number;
  intomoney: number;
}
