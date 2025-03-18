export interface EmployeeStatistics {
  totalEmployees: number;
  activeEmployees: number;
  resignedEmployees: number;
  newEmployees: number;
}

export interface ProductStatistics {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  notYetSoldProducts: number;
}

export interface SupplierStatistics {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
}

export interface CategoryStatistics {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
}

export interface AccountStatistics {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  roles: {
    admin: number;
    user: number;
  };
}
