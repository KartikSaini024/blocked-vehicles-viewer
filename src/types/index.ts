export interface CarDetails {
    carid: number;
    make: string;
    model: string;
    year: number;
    colour: string;
    fleetno: string;
    size: string;
    rego: string;
}

export interface BlockedReservation {
    reservationno: number;
    pickupdatetime: string; // "19-Jan-2026 12:30"
    dropoffdatetime: string;
    rentaldays: number;
    pickuplocation: string;
    dropofflocation: string;
    registrationno: string;
    currentrcmregistrationno: string;
    aclastname: string; // Often holds the reason or name
    reservationtypeid: number; // 3 for maintenance
    isdonotmove: boolean;
    categoryid?: number;
    carDetails?: CarDetails | null;
}
