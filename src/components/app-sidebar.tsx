'use client'

import {
  LayoutDashboard,
  ArrowRightLeft,
  Settings,
  FileText,
  Database,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transaksi",
    url: "/pembelian",
    icon: ArrowRightLeft,
    subItems: [
      { title: "Pembelian", url: "/pembelian" },
      { title: "Penjualan", url: "/penjualan" },
      { title: "Adjustment", url: "/adjustment" },
    ],
  },
  {
    title: "Laporan",
    url: "/lap-stock",
    icon: FileText,
    subItems: [
      { title: "Laporan Stok", url: "/lap-stock" },
      { title: "Laporan Supplier", url: "/lap-supplier" },
      { title: "Laporan Transaksi", url: "/lap-transaksi" },
    ],
  },
  {
    title: "Master Data",
    url: "/barang",
    icon: Database,
    subItems: [
      { title: "Barang", url: "/barang" },
      { title: "Pelanggan", url: "/pelanggan" },
      { title: "Supplier", url: "/supplier" },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    document.cookie =
      "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/login")
  }

  // Mendeteksi route aktif, termasuk halaman turunan seperti /barang/tambah.
  const isPathActive = (url: string) => {
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  return (
    <Sidebar className="border-r border-zinc-100 bg-white">
      <SidebarHeader className="min-h-[60px] border-b border-zinc-100 bg-white p-4 flex items-center">
        <span className="text-sm font-bold tracking-tight text-zinc-900">
          TOKO BANGUNAN
        </span>
      </SidebarHeader>

      <SidebarContent className="bg-white p-2">
        <SidebarMenu className="gap-1">
          {mainItems.map((item) => {
            const isMenuRouteActive =
              isPathActive(item.url) ||
              item.subItems?.some((sub) => isPathActive(sub.url)) ||
              false

            return (
              <div key={item.title} className="flex w-full flex-col">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => router.push(item.url)}
                    className={`w-full rounded-none border-l-2 px-4 py-5 transition-colors hover:bg-zinc-50 hover:text-zinc-900 ${
                      isMenuRouteActive
                        ? "border-black bg-zinc-50 font-bold text-zinc-900"
                        : "border-transparent font-medium text-zinc-600"
                    }`}
                  >
                    <item.icon
                      className={`h-4 w-4 ${
                        isMenuRouteActive
                          ? "text-zinc-900"
                          : "text-zinc-500"
                      }`}
                    />
                    <span className="text-[13px]">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {item.subItems && isMenuRouteActive && (
                  <div className="Dashboard-sub-list flex flex-col gap-1 border-l-2 border-zinc-900/10 bg-zinc-50/50 py-2 pl-10 pr-4">
                    {item.subItems.map((sub) => {
                      const isSubActive = isPathActive(sub.url)

                      return (
                        <Link
                          key={sub.title}
                          href={sub.url}
                          className={`block py-1.5 text-[12px] transition-colors ${
                            isSubActive
                              ? "font-bold text-zinc-900"
                              : "font-medium text-zinc-500 hover:text-zinc-900"
                          }`}
                        >
                          {sub.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-100 bg-white p-4">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-none px-4 py-4 text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
              <Settings className="h-4 w-4 text-zinc-500" />
              <span className="text-[13px] font-medium">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="rounded-none px-4 py-4 text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              <LogOut className="h-4 w-4 text-zinc-500" />
              <span className="text-[13px] font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
