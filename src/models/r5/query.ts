import { z } from 'zod';

type ReportPeriodQuery = {
  begin_date: string;
  end_date: string;
};

export const ReportPeriodQueryValidation = z.custom<ReportPeriodQuery>((val) => {
  if (typeof val?.begin_date !== 'string' || typeof val?.end_date !== 'string') {
    return false;
  }

  try {
    const beginDate = new Date(val.begin_date);
    const endDate = new Date(val.end_date);

    if (beginDate <= endDate) {
      return val;
    }
    return false;
  } catch {
    return false;
  }
});

export const AnyReportFilterQueryValidation = z.object({
  platform: z.string(),
}).partial();

export const MasterReportFiltersQueryValidation = AnyReportFilterQueryValidation.extend({
  metric_type: z.string(), // can be |
  data_type: z.string(), // can be |
  access_method: z.string(), // can be |
  attributes_to_show: z.string(), // can be |
  granularity: z.enum(['month', 'totals']),
}).partial();

export const DatabaseReportFiltersQueryValidation = MasterReportFiltersQueryValidation.extend({
  database: z.string(),
}).partial();

export const TitleReportFiltersQueryValidation = MasterReportFiltersQueryValidation.extend({
  item_id: z.string(),
  yop: z.string(), // can be |, yyyy|yyyy|yyyy-yyyy
  access_type: z.string(), // can be |
}).partial();

export const ItemReportFiltersQueryValidation = MasterReportFiltersQueryValidation.extend({
  item_id: z.string(),
  item_contributor: z.string(),
  yop: z.string(), // can be |, yyyy|yyyy|yyyy-yyyy
  access_type: z.string(), // can be |
  include_component_details: z.string(),
  include_parent_details: z.string(),
}).partial();
