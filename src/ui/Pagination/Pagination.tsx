import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Button } from "../Button";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant="outline"
        disabled={currentPage === 1}
        aria-label="Przejdź do pierwszej strony"
        onClick={() => onPageChange(1)}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="icon"
        variant="outline"
        disabled={currentPage === 1}
        aria-label="Przejdź do poprzedniej strony"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm text-gray-700">
        Strona {currentPage} / {totalPages}
      </span>

      <Button
        type="button"
        size="icon"
        variant="outline"
        disabled={currentPage === totalPages}
        aria-label="Przejdź do następnej strony"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="icon"
        variant="outline"
        disabled={currentPage === totalPages}
        aria-label="Przejdź do ostatniej strony"
        onClick={() => onPageChange(totalPages)}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
