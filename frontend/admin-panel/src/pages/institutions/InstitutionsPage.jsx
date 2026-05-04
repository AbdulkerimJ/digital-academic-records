import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { listInstitutions, listInstitutionTypes } from "../../api/institutions.api"
import { Button } from "../../components/ui/button"
import { Plus, Building2, GraduationCap, AlertTriangle } from "lucide-react"
import { Card } from "../../components/ui/card"

import InstitutionFilters from "./InstitutionFilters"
import InstitutionTable from "./InstitutionTable"
import InstitutionModal from "./InstitutionModal"
import PageLoader from "../../components/common/PageLoader"
import TableSkeleton from "../../components/common/TableSkeleton"
import useDebounce from "../../hooks/useDebounce"

export default function InstitutionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [institutionToEdit, setInstitutionToEdit] = useState(null)
  
  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
  
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortBy, setSortBy] = useState("name")
  const [sortDir, setSortDir] = useState("ASC")

  const queryClient = useQueryClient()

  const { data: instData, isLoading, error, isFetching } = useQuery({
    queryKey: ["institutions", { page, limit, sortBy, sortDir, searchTerm: debouncedSearch, typeFilter, statusFilter }],
    queryFn: () => listInstitutions({ 
      page, 
      limit, 
      offset: (page - 1) * limit,
      sortBy, 
      sortDir, 
      search: debouncedSearch, 
      type: typeFilter, 
      status: statusFilter 
    }),
    placeholderData: (previousData) => previousData
  })

  const { data: typesData } = useQuery({
    queryKey: ["institution-types"],
    queryFn: listInstitutionTypes
  })

  const institutions = instData?.data?.institutions || []
  const totalCount = instData?.data?.totalCount || 0
  const institutionTypes = typesData?.data?.types || []

  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setStatusFilter("all")
    setPage(1)
  }

  const handleFilterChange = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  if (error) return (
    <Card className="p-12 flex flex-col items-center justify-center text-center border-destructive/20 bg-destructive/5">
      <AlertTriangle size={48} className="text-destructive mb-4" />
      <h3 className="text-xl font-bold text-destructive mb-2">Failed to load institutions</h3>
      <p className="text-muted-foreground">{error.response?.data?.message || error.message}</p>
    </Card>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -top-12 text-primary/5 rotate-12 pointer-events-none">
          <Building2 size={200} />
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-3.5 bg-background shadow-sm rounded-xl text-primary border border-primary/10">
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground font-serif">Institutions Registry</h2>
            <p className="text-muted-foreground mt-1">Manage partner universities, exam boards, and regional offices.</p>
          </div>
        </div>
        <Button 
          onClick={() => {
            setInstitutionToEdit(null)
            setIsModalOpen(true)
          }} 
          className="gap-2 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 relative z-10 h-11 px-6 rounded-xl font-semibold"
        >
          <Plus size={18} />
          New Institution
        </Button>
      </div>

      <InstitutionFilters 
        searchTerm={searchTerm}
        setSearchTerm={handleFilterChange(setSearchTerm)}
        typeFilter={typeFilter}
        setTypeFilter={handleFilterChange(setTypeFilter)}
        statusFilter={statusFilter}
        setStatusFilter={handleFilterChange(setStatusFilter)}
        onClear={clearFilters}
        institutionTypes={institutionTypes}
      />

      {isLoading && !instData ? (
        <TableSkeleton rows={limit} columns={5} />
      ) : (
        <InstitutionTable 
          institutions={institutions}
          totalCount={totalCount}
          currentPage={page}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={(field) => {
            if (sortBy === field) {
              setSortDir(sortDir === "ASC" ? "DESC" : "ASC")
            } else {
              setSortBy(field)
              setSortDir("ASC")
            }
          }}
          isFiltered={searchTerm || typeFilter !== "all" || statusFilter !== "all"}
          isFetching={isFetching}
          onEdit={(inst) => {
            setInstitutionToEdit(inst)
            setIsModalOpen(true)
          }}
          onAdd={() => setIsModalOpen(true)}
          onClearFilters={clearFilters}
        />
      )}

      <InstitutionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setInstitutionToEdit(null)
        }} 
        institution={institutionToEdit}
        institutionTypes={institutionTypes}
      />
    </div>
  )
}
