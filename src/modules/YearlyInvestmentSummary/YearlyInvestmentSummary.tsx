import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../createClient";

const INVESTMENT_CATEGORY_NAME = "inwestycje";

const TRAVEL_CATEGORY_KEY = "travels";
const TRAVEL_CATEGORY_FALLBACK = "podróże/wakacje";

const CLOTHES_CATEGORY_KEY = "clothes";
const CLOTHES_CATEGORY_FALLBACK = "ubrania/sprzęt sportowy";

type YearlyInvestmentSummaryProps = {
  userId: string | null;
};

type ComparisonCardProps = {
  title: string;
  planned: number | null;
  actual: number | null;
  loading: boolean;
  baseColor: string;
};

const ComparisonCard = ({
  title,
  planned,
  actual,
  loading,
  baseColor,
}: ComparisonCardProps) => {
  const difference = useMemo(
    () => (Number(planned || 0) - Number(actual || 0)).toFixed(2),
    [planned, actual],
  );

  return (
    <div className="flex h-full min-h-[150px] w-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {/* <p className="text-sm font-medium leading-5 text-slate-500">{title}</p> */}
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: baseColor }}
        />
        <span className="text-sm font-medium leading-5 text-slate-500">
          {title}
        </span>
      </div>

      <div className="mt-auto space-y-2 pt-5">
        <div className="grid grid-cols-[90px_1fr] items-center text-sm text-slate-700">
          <span>Plan</span>
          <span className="text-right font-medium text-slate-900">
            {planned?.toFixed(2) ?? "0.00"} zł
          </span>
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center text-sm text-slate-700">
          <span>Rzeczyw.</span>
          <span className="text-right font-medium text-slate-900">
            {loading ? "Ładowanie…" : `${actual?.toFixed(2) ?? "0.00"} zł`}
          </span>
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
          <span>Saldo</span>
          <span className="text-right">{difference} zł</span>
        </div>
      </div>
    </div>
  );
};

const YearlyInvestmentSummary = ({ userId }: YearlyInvestmentSummaryProps) => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<number>(currentYear);

  const [investmentSum, setInvestmentSum] = useState<number | null>(null);
  const [ipBoxSum, setIpBoxSum] = useState<number | null>(null);

  const [travelPlanned, setTravelPlanned] = useState<number | null>(null);
  const [travelActual, setTravelActual] = useState<number | null>(null);
  const [travelCategoryName, setTravelCategoryName] = useState<string>(
    TRAVEL_CATEGORY_FALLBACK,
  );

  const [clothesPlanned, setClothesPlanned] = useState<number | null>(null);
  const [clothesActual, setClothesActual] = useState<number | null>(null);
  const [clothesCategoryName, setClothesCategoryName] = useState<string>(
    CLOTHES_CATEGORY_FALLBACK,
  );

  const [loadingInvestment, setLoadingInvestment] = useState(false);
  const [loadingTravel, setLoadingTravel] = useState(false);
  const [loadingClothes, setLoadingClothes] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("key, name")
        .eq("user_id", userId)
        .in("key", [TRAVEL_CATEGORY_KEY, CLOTHES_CATEGORY_KEY]);

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      const travelCategory = data?.find(
        (category) => category.key === TRAVEL_CATEGORY_KEY,
      );

      const clothesCategory = data?.find(
        (category) => category.key === CLOTHES_CATEGORY_KEY,
      );

      if (travelCategory?.name) {
        setTravelCategoryName(travelCategory.name);
      }

      if (clothesCategory?.name) {
        setClothesCategoryName(clothesCategory.name);
      }
    };

    fetchCategories();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fromDate = `${year}-01-01`;
    const toDate = `${year}-12-31`;

    const fetchInvestmentSum = async () => {
      setLoadingInvestment(true);

      const { data, error } = await supabase
        .from("expenses")
        .select("cost")
        .eq("user_id", userId)
        .eq("category", INVESTMENT_CATEGORY_NAME)
        .gte("date", fromDate)
        .lte("date", toDate);

      if (error) {
        console.error("Error fetching investment sum:", error);
        setInvestmentSum(0);
      } else {
        setInvestmentSum(
          data?.reduce(
            (sum: number, item: { cost: number }) =>
              sum + Number(item.cost || 0),
            0,
          ) ?? 0,
        );
      }

      setLoadingInvestment(false);
    };

    const fetchPlannedValues = async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("travels, clothes, ip_box")
        .eq("user_id", userId)
        .gte("month", `${year}-01`)
        .lte("month", `${year}-12`);

      if (error) {
        console.error("Error fetching planned values:", error);
        setTravelPlanned(0);
        setClothesPlanned(0);
        setIpBoxSum(0);
      } else {
        setTravelPlanned(
          data?.reduce(
            (sum: number, item: { travels?: number }) =>
              sum + Number(item.travels || 0),
            0,
          ) ?? 0,
        );

        setClothesPlanned(
          data?.reduce(
            (sum: number, item: { clothes?: number }) =>
              sum + Number(item.clothes || 0),
            0,
          ) ?? 0,
        );

        setIpBoxSum(
          data?.reduce(
            (sum: number, item: { ip_box?: number }) =>
              sum + Number(item.ip_box || 0),
            0,
          ) ?? 0,
        );
      }
    };

    const fetchTravelActual = async () => {
      setLoadingTravel(true);

      const { data, error } = await supabase
        .from("expenses")
        .select("cost")
        .eq("user_id", userId)
        .eq("category", travelCategoryName)
        .gte("date", fromDate)
        .lte("date", toDate);

      if (error) {
        console.error("Error fetching travel actual:", error);
        setTravelActual(0);
      } else {
        setTravelActual(
          data?.reduce(
            (sum: number, item: { cost: number }) =>
              sum + Number(item.cost || 0),
            0,
          ) ?? 0,
        );
      }

      setLoadingTravel(false);
    };

    const fetchClothesActual = async () => {
      setLoadingClothes(true);

      const { data, error } = await supabase
        .from("expenses")
        .select("cost")
        .eq("user_id", userId)
        .eq("category", clothesCategoryName)
        .gte("date", fromDate)
        .lte("date", toDate);

      if (error) {
        console.error("Error fetching clothes actual:", error);
        setClothesActual(0);
      } else {
        setClothesActual(
          data?.reduce(
            (sum: number, item: { cost: number }) =>
              sum + Number(item.cost || 0),
            0,
          ) ?? 0,
        );
      }

      setLoadingClothes(false);
    };

    fetchInvestmentSum();
    fetchPlannedValues();
    fetchTravelActual();
    fetchClothesActual();
  }, [year, userId, travelCategoryName, clothesCategoryName]);

  return (
    <div className="mt-5 w-full min-w-0 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-900">
            Roczne podsumowanie finansów
          </p>
          <p className="max-w-lg text-sm text-slate-500">
            Podsumowanie roczne: inwestycje, podróże, ubrania/sprzęt sportowy
            oraz szacowany zwrot IP Box.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-sm text-slate-600">Rok</span>
          <input
            type="number"
            min="2000"
            max="2100"
            step="1"
            value={year}
            onChange={(e) => {
              const nextYear = Number(e.target.value);
              setYear(isNaN(nextYear) ? currentYear : nextYear);
            }}
            className="w-20 border-none bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex min-h-[150px] min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">
            Inwestycje — łączne wydatki w danym roku
          </p>

          <p className="mt-auto text-2xl font-bold text-slate-900">
            {loadingInvestment
              ? "Ładowanie…"
              : `${investmentSum?.toFixed(2) ?? "0.00"} zł`}
          </p>
        </div>

        <div className="flex min-h-[150px] min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">
            IP Box — szacowany zwrot za dany rok dotychczas
          </p>

          <p className="mt-auto text-2xl font-bold text-slate-900">
            {ipBoxSum == null ? "Ładowanie…" : `${ipBoxSum.toFixed(2)} zł`}
          </p>
        </div>

        <div className="min-w-0">
          <ComparisonCard
            title="Podróże — planowane vs zrealizowane"
            planned={travelPlanned}
            actual={travelActual}
            loading={loadingTravel}
            baseColor="rgb(254, 205, 211)"
          />
        </div>

        <div className="min-w-0">
          <ComparisonCard
            title="Ubrania / sprzęt sportowy — planowane vs zrealizowane"
            planned={clothesPlanned}
            actual={clothesActual}
            loading={loadingClothes}
            baseColor="rgb(165, 243, 252)"
          />
        </div>
      </div>
    </div>
  );
};

export default YearlyInvestmentSummary;
