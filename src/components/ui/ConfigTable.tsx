'use client'

import React, { useState } from 'react'
import { Table, Button, Space, Input, Select, DatePicker } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'
import ConfigPagination from './ConfigPagination'

const { RangePicker } = DatePicker

export interface TableColumnConfig {
  title: string
  dataIndex: string
  key: string
  width?: number | string
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  render?: (text: any, record: any, index: number) => React.ReactNode
  sorter?: boolean | ((a: any, b: any) => number)
  filters?: { text: string; value: any }[]
  searchable?: boolean
  searchType?: 'input' | 'select' | 'date' | 'daterange'
  searchOptions?: { label: string; value: any }[]
}

export interface ActionConfig {
  title?: string
  key: string
  width?: number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  actions: Array<{
    key: string
    label: string
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
    danger?: boolean
    icon?: React.ReactNode
    onClick: (record: any) => void
    confirm?: boolean
    confirmText?: string
  }>
}

export interface ConfigTableProps {
  columns: TableColumnConfig[]
  dataSource: any[]
  loading?: boolean
  rowKey?: string | ((record: any) => string)
  pagination?: {
    current?: number
    pageSize?: number
    total?: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
    showTotal?: (total: number, range: [number, number]) => string
  }
  actions?: ActionConfig | null
  searchable?: boolean
  addable?: boolean
  onAdd?: () => void
  onRefresh?: () => void
  onSearch?: (filters: Record<string, any>) => void
  onPageChange?: (page: number, pageSize: number) => void
  scroll?: { x?: number | string; y?: number | string }
  size?: 'small' | 'middle' | 'large'
  bordered?: boolean
}

const ConfigTable: React.FC<ConfigTableProps> = ({
  columns,
  dataSource,
  loading = false,
  rowKey = 'id',
  pagination = {},
  actions = null,
  searchable = true,
  addable = true,
  onAdd,
  onRefresh,
  onSearch,
  onPageChange,
  scroll,
  size = 'middle',
  bordered = false
}) => {
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 构建表格列
  const tableColumns: ColumnType<any>[] = [
    ...columns.map((col) => ({
      title: col.title,
      dataIndex: col.dataIndex,
      key: col.key,
      width: col.width,
      fixed: col.fixed,
      align: col.align,
      render: col.render,
      sorter: col.sorter,
      filters: col.filters,
      onFilter: col.filters ? (value: any, record: any) => record[col.dataIndex] === value : undefined
    })),
    // 操作列
    ...(actions ? [{
      title: actions.title || '操作',
      key: actions.key || 'actions',
      width: actions.width || 150,
      fixed: 'right' as const,
      align: actions.align || 'center',
      render: (_: any, record: any) => (
        <Space size="small">
          {actions.actions?.map((action: any) => (
            <Button
              key={action.key}
              type={action.type}
              danger={action.danger}
              icon={action.icon}
              size="small"
              onClick={() => action.onClick(record)}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      )
    }] : [])
  ]

  // 构建搜索表单
  const searchColumns = columns.filter(col => col.searchable)
  const renderSearchField = (col: TableColumnConfig) => {
    const { searchType = 'input', searchOptions = [] } = col

    switch (searchType) {
      case 'select':
        return (
          <Select
            placeholder={`请选择${col.title}`}
            allowClear
            className="w-50 min-w-48"
            onChange={(value) => handleSearchChange(col.dataIndex, value)}
          >
            {searchOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        )
      case 'date':
        return (
          <DatePicker
            placeholder={`请选择${col.title}`}
            className="w-50 min-w-48"
            onChange={(date) => handleSearchChange(col.dataIndex, date?.toISOString())}
          />
        )
      case 'daterange':
        return (
          <RangePicker
            className="w-60 min-w-56"
            onChange={(dates) => {
              if (dates) {
                handleSearchChange(`${col.dataIndex}Start`, dates[0]?.toISOString())
                handleSearchChange(`${col.dataIndex}End`, dates[1]?.toISOString())
              }
            }}
          />
        )
      default:
        return (
          <Input
            placeholder={`请输入${col.title}`}
            className="w-50 min-w-48"
            onChange={(e) => handleSearchChange(col.dataIndex, e.target.value)}
            allowClear
          />
        )
    }
  }

  const handleSearchChange = (key: string, value: any) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSearch = () => {
    onSearch?.(searchFilters)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSearchFilters({})
    onSearch?.({})
    setCurrentPage(1)
  }

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page)
    setPageSize(size)
    onPageChange?.(page, size)
  }

  // 分页配置
  const paginationConfig = {
    showSizeChanger: pagination.showSizeChanger ?? true,
    showQuickJumper: pagination.showQuickJumper ?? true,
    showTotal: pagination.showTotal ?? true
  }

  return (
    <>
      {/* 搜索区域 */}
      {searchable && searchColumns.length > 0 && (
        <div className="mb-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-wrap gap-4 items-end">
            {searchColumns.map((col) => (
              <div key={col.key} className="flex flex-col">
                <div className="mb-1 text-xs text-gray-600 font-medium">
                  {col.title}
                </div>
                {renderSearchField(col)}
              </div>
            ))}
            <div className="flex gap-2 items-end">
              <Button type="primary" size="small" onClick={handleSearch} className="bg-blue-500 hover:bg-blue-600 text-12px">
                搜索
              </Button>
              <Button size="small" onClick={handleReset} className="border-gray-300 text-gray-700 hover:bg-gray-50 text-12px">
                重置
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className='p-4 bg-gray-50 rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0'>
        {/* 操作按钮区域 */}
        <div className="mb-4 flex justify-end items-center flex-shrink-0">
          <Space>
          {addable && onAdd && (
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onAdd} className="bg-green-500 hover:bg-green-600">
                新增
              </Button>
            )}
            {onRefresh && (
              <Button size="small" icon={<ReloadOutlined />} onClick={onRefresh} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                刷新
              </Button>
            )}
          </Space>
        </div>

        {/* 表格容器 */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 h-0 overflow-y-auto">
            <Table
              columns={tableColumns}
              dataSource={dataSource}
              loading={loading}
              rowKey={rowKey}
              pagination={false} // 禁用内置分页，使用自定义分页组件
              scroll={{
                x: scroll?.x || 'max-content',
                y: scroll?.y || '100%' // 默认高度100%，支持纵向滚动
              }}
              sticky={{ offsetHeader: 0 }}
              size={size}
              bordered={bordered}
              rowClassName="hover:bg-gray-50 transition-colors"
              onChange={(pagination, filters, sorter) => {
                // 处理排序和筛选
                console.log('Table changed:', { pagination, filters, sorter })
              }}
            />
          </div>

        </div>

        {/* 自定义分页组件 */}
        {pagination.total && pagination.total > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <ConfigPagination
              current={currentPage}
              pageSize={pageSize}
              total={pagination.total || 0}
              showSizeChanger={paginationConfig.showSizeChanger}
              showQuickJumper={paginationConfig.showQuickJumper}
              showTotal={paginationConfig.showTotal}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
              size={size === 'small' ? 'small' : 'default'}
              align="center"
              className="w-full"
            />
          </div>
        )}
      </div>
    </>
  )
}

export default ConfigTable
