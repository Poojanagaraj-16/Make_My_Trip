export interface CityPair {
  readonly sourceCity: string;
  readonly destinationCity: string;
}

export interface RelativeTravelDates {
  readonly futureDaysFromToday: number;
  readonly changedDaysFromToday: number;
  readonly pastDaysAgo: number;
}

export interface Passenger {
  readonly name: string;
  readonly age: string;
  readonly gender: string;
  readonly mobile: string;
}

export interface BusSearchTestData {
  readonly validSearch: CityPair;
  readonly sameCitySearch: CityPair;
  readonly sourceSuggestion: { readonly city: string };
  readonly destinationSuggestion: { readonly city: string };
}

export interface BusFilterTestData {
  readonly departureTime: string;
  readonly multiFilterError: string;
}

export interface PassengerTestData {
  readonly validPassenger: Passenger;
  readonly invalidMobile: { readonly mobile: string };
  readonly blankPassenger: Passenger;
}
