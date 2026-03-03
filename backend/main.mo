import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type FuelType = {
    #petrol;
    #premium;
    #diesel;
  };

  public type PaymentMethod = {
    #cash;
    #creditCard;
    #mobileMoney;
  };

  public type FuelSaleRecord = {
    timestamp : Int;
    fuelType : FuelType;
    quantityLitres : Nat;
    pricePerLitre : Nat;
    totalAmount : Nat;
    vehiclePlate : Text;
    attendantName : Text;
    paymentMethod : PaymentMethod;
  };

  public type Salary = {
    amount : Nat;
    payPeriod : PayPeriod;
  };

  public type PayPeriod = {
    #monthly;
    #annual;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
    contact : Text;
    salary : Salary;
  };

  public type PurchaseOrder = {
    poNumber : Text;
    invoiceNumber : ?Text;
    supplier : Text;
    invoicePrice : Nat;
    invoiceDate : Text;
    totalLitres : Nat;
    litrPrice : Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Stable storage for fuel sale records, persisted across upgrades
  var fuelSaleRecords : [FuelSaleRecord] = [];

  // User profile functions

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Fuel sale record functions

  /// Create a new fuel sale record. Only authenticated users (attendants) can create records.
  public shared ({ caller }) func createSaleRecord(record : FuelSaleRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create sale records");
    };
    // Use .concat to add new record
    fuelSaleRecords := fuelSaleRecords.concat([record]);
  };

  /// Retrieve all fuel sale records. Only authenticated users can view sales data.
  public query ({ caller }) func getAllSaleRecords() : async [FuelSaleRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sale records");
    };
    fuelSaleRecords;
  };
};
