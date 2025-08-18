'use client'

import React, { useState } from 'react'
import ConfigTable, { TableColumnConfig, ActionConfig } from '@/components/ui/ConfigTable'

export default function OrganizationsPage() {
  const [loading, setLoading] = useState(false)

  // 组织管理的列配置
  const organizationColumns: TableColumnConfig[] = [
    {
      title: '组织名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      searchable: true,
      searchType: 'input'
    },
    {
      title: '组织编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      searchable: true,
      searchType: 'input'
    },
    {
      title: '组织类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      searchable: true,
      searchType: 'select',
      searchOptions: [
        { label: '公司', value: 'company' },
        { label: '部门', value: 'department' },
        { label: '团队', value: 'team' }
      ],
      render: (text: string) => {
        const typeMap: Record<string, string> = {
          company: '公司',
          department: '部门',
          team: '团队'
        }
        return typeMap[text] || text
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      searchable: true,
      searchType: 'select',
      searchOptions: [
        { label: '启用', value: true },
        { label: '禁用', value: false }
      ],
      render: (status: boolean) => (
        <span style={{ color: status ? '#52c41a' : '#ff4d4f' }}>
          {status ? '启用' : '禁用'}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      searchable: true,
      searchType: 'daterange',
      render: (text: string) => new Date(text).toLocaleDateString()
    }
  ]

  // 组织管理的操作按钮
  const organizationActions: ActionConfig = {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'left',
    align: 'center',
    actions: [
      {
        key: 'view',
        label: '查看',
        type: 'link',
        onClick: (record: any) => {
          console.log('查看组织:', record)
        }
      },
      {
        key: 'edit',
        label: '编辑',
        type: 'link',
        onClick: (record: any) => {
          console.log('编辑组织:', record)
        }
      },
      {
        key: 'delete',
        label: '删除',
        type: 'link',
        danger: true,
        onClick: (record: any) => {
          console.log('删除组织:', record)
        }
      }
    ]
  }

  // 模拟组织数据
  const organizationData = [
    {
      id: 1,
      name: '总公司',
      code: 'HQ',
      type: 'company',
      status: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: '技术部',
      code: 'TECH',
      type: 'department',
      status: true,
      createdAt: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      name: '产品部',
      code: 'PROD',
      type: 'department',
      status: true,
      createdAt: '2024-01-03T00:00:00Z'
    },
    {
      id: 4,
      name: '设计部',
      code: 'DESIGN',
      type: 'department',
      status: true,
      createdAt: '2024-01-04T00:00:00Z'
    },
    {
      id: 5,
      name: '市场部',
      code: 'MKT',
      type: 'department',
      status: true,
      createdAt: '2024-01-05T00:00:00Z'
    },
    {
      id: 6,
      name: '人事部',
      code: 'HR',
      type: 'department',
      status: true,
      createdAt: '2024-01-06T00:00:00Z'
    },
    {
      id: 7,
      name: '财务部',
      code: 'FIN',
      type: 'department',
      status: true,
      createdAt: '2024-01-07T00:00:00Z'
    },
    {
      id: 8,
      name: '运营部',
      code: 'OPS',
      type: 'department',
      status: true,
      createdAt: '2024-01-08T00:00:00Z'
    },
    {
      id: 9,
      name: '测试部',
      code: 'QA',
      type: 'department',
      status: true,
      createdAt: '2024-01-09T00:00:00Z'
    },
    {
      id: 10,
      name: '运维部',
      code: 'DEVOPS',
      type: 'department',
      status: true,
      createdAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 11,
      name: '客服部',
      code: 'CS',
      type: 'department',
      status: true,
      createdAt: '2024-01-11T00:00:00Z'
    },
    {
      id: 12,
      name: '法务部',
      code: 'LEGAL',
      type: 'department',
      status: true,
      createdAt: '2024-01-12T00:00:00Z'
    },
    {
      id: 13,
      name: '采购部',
      code: 'PURCHASE',
      type: 'department',
      status: true,
      createdAt: '2024-01-13T00:00:00Z'
    },
    {
      id: 14,
      name: '仓储部',
      code: 'WAREHOUSE',
      type: 'department',
      status: true,
      createdAt: '2024-01-14T00:00:00Z'
    },
    {
      id: 15,
      name: '物流部',
      code: 'LOGISTICS',
      type: 'department',
      status: true,
      createdAt: '2024-01-15T00:00:00Z'
    }
  ]

  const handleAdd = () => {
    console.log('新增组织')
  }

  const handleRefresh = () => {
    setLoading(true)
    // 模拟刷新
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleSearch = (filters: Record<string, any>) => {
    console.log('搜索条件:', filters)
    // 这里可以根据搜索条件过滤数据
  }

  const handlePageChange = (page: number, pageSize: number) => {
    console.log('分页变化:', { page, pageSize })
    // 这里可以调用API获取对应页的数据
  }

  return (
    <ConfigTable
      columns={organizationColumns}
      dataSource={organizationData}
      loading={loading}
      rowKey="id"
      pagination={{
        total: organizationData.length,
        showSizeChanger: true,
        showQuickJumper: true
      }}
      actions={organizationActions}
      searchable={true}
      addable={true}
      onAdd={handleAdd}
      onRefresh={handleRefresh}
      onSearch={handleSearch}
      onPageChange={handlePageChange}
      size="small"
      bordered={false}
    />
  )
}