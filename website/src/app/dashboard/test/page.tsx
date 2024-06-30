"use client";

import { Combobox } from "@/components/ComboBox";
import useUsers from "@/hooks/useUsers";

export default function Test() {
  const {data: users} = useUsers();
  const options = users?.map(user => ({id: user.address_ as  string, name: user.name})) ?? [];
  return <Combobox className="h-20 w-auto border border-gray-300 rounded-md shadow-sm bg-slate-600" options={options} value={options[0]} onChange={(option) => {
    console.log(option);
  }}></Combobox>
}
