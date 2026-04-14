
import { FetchError } from 'ofetch';
type T = ReturnType<typeof useFetch>
type Status = T["status"]
type Data = T["data"]


export function useMultipleFetch(fetchResults: ReturnType<typeof useFetch>[]) {
    // Create a ref for combined status
    const combinedStatus: Status = computed(() => {
        if (fetchResults.some(result => result.status.value === 'error')) return 'error'
        if (fetchResults.some(result => result.status.value === 'pending')) return 'pending'
        if (fetchResults.every(result => result.status.value === 'success')) return 'success'
        return "idle"
    })

    const firstError = computed(() => {
        return (fetchResults.find(result => result.error) ?? null) as any as FetchError<any> | null
    })

    const combinedData: Data[] = fetchResults.map(result => result.data)

    const refresh = () => { fetchResults.forEach(result => result.refresh()); }
    const clear = () => { fetchResults.forEach(result => result.clear()); }

    return { status: combinedStatus, refresh, clear, error: firstError, data: combinedData };
}