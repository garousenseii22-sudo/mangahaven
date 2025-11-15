import React, { useEffect, useState } from 'react'
import MangaCard from '../components/MangaCard'
import type { MangaSummary } from '../types'


export default function Favorites() {
const [list, setList] = useState<MangaSummary[]>([])
useEffect(() => {
const raw = localStorage.getItem('manga:favorites')
if (raw) setList(JSON.parse(raw))
}, [])


return (
<main className="p-4">
<h2 className="text-lg font-semibold mb-4">Favorites</h2>
{list.length === 0 ? (
<p className="text-gray-500">No favorites yet. Add some from the home page.</p>
) : (
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
{list.map((m) => (
<MangaCard key={m.id} manga={m} />
))}
</div>
)}
</main>
)
}