import { Divider, Flex, Stack, Table, Title } from "@mantine/core";
import PropTypes from "prop-types";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import {
  MRT_GlobalFilterTextInput as FilterTextInput,
  MRT_TablePagination as TablePagination,
  MRT_ToolbarAlertBanner as ToolbarAlertBanner,
  flexRender,
  useMantineReactTable,
} from "mantine-react-table";
import "mantine-react-table/styles.css";
import "./SpecialTable.css";

function SpecialTable({ title, columns, data, rowOptions }) {
  const table = useMantineReactTable({
    columns,
    data,
    enableRowSelection: false,
    initialState: {
      pagination: {
        pageSize: rowOptions ? parseInt(rowOptions[0], 10) : 5,
        pageIndex: 0,
      },
      showGlobalFilter: true,
    },
    mantinePaginationProps: {
      rowsPerPageOptions: rowOptions ?? ["5", "10", "20"],
    },
    paginationDisplayMode: "pages",
  });

  return (
    <div>
      <Stack>
        <Divider />
        <Title order={4} fw={300} c="blue.7">{title ?? "My Special Table"}</Title>
        <Flex justify="space-between" align="center">
          <FilterTextInput table={table} />
          <TablePagination table={table} />
        </Flex>
        <Table
          className="special-table"
          captionSide="top"
          fz="md"
          highlightOnHover
          horizontalSpacing="md"
          verticalSpacing="sm"
          withTableBorder
          withColumnBorders
          m="0"
        >
          <Table.Thead className="table-head">
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id} className="header-row">
                {headerGroup.headers.map((header) => (
                  <Table.Th key={header.id} className="header-cell">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.Header ??
                            header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody className="table-body">
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id} className="body-row">
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id} className="body-cell">
                    {flexRender(
                      cell.column.columnDef.cell ?? cell.column.columnDef.Cell,
                      cell.getContext(),
                    )}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <ToolbarAlertBanner stackAlertBanner table={table} />
      </Stack>
    </div>
  );
}

SpecialTable.propTypes = {
  title: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf.isRequired,
  data: PropTypes.arrayOf.isRequired,
  rowOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SpecialTable;
