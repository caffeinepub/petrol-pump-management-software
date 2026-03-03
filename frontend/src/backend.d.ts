import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Salary {
    payPeriod: PayPeriod;
    amount: bigint;
}
export interface FuelSaleRecord {
    paymentMethod: PaymentMethod;
    pricePerLitre: bigint;
    vehiclePlate: string;
    attendantName: string;
    quantityLitres: bigint;
    fuelType: FuelType;
    totalAmount: bigint;
    timestamp: bigint;
}
export interface UserProfile {
    contact: string;
    salary: Salary;
    name: string;
    role: string;
}
export enum FuelType {
    premium = "premium",
    petrol = "petrol",
    diesel = "diesel"
}
export enum PayPeriod {
    annual = "annual",
    monthly = "monthly"
}
export enum PaymentMethod {
    mobileMoney = "mobileMoney",
    creditCard = "creditCard",
    cash = "cash"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Create a new fuel sale record. Only authenticated users (attendants) can create records.
     */
    createSaleRecord(record: FuelSaleRecord): Promise<void>;
    /**
     * / Retrieve all fuel sale records. Only authenticated users can view sales data.
     */
    getAllSaleRecords(): Promise<Array<FuelSaleRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
