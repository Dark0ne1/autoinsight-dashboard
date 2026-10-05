# Test datasets

## autoinsight_demo_marketing_dataset.csv

[Download / view CSV](autoinsight_demo_marketing_dataset.csv)

A user-provided marketing test dataset, included unchanged. It is separate from the application's built-in `backend/demo/marketing.csv`; the demo button and existing screenshots continue to use that built-in sample.

| Property | Value |
| --- | --- |
| Rows | 1,101 |
| Fields | 17 |
| Date coverage | 2026-01-01 to 2026-09-30 |
| Numeric metrics | impressions, clicks, spend, leads, orders, revenue |
| Other fields | date, campaign, channel, region, device, landing_page, account_manager, currency, is_promo_period, creative_id, notes |
| File size | 132,560 bytes |
| SHA-256 | `19922092bf4a34b3125ce18a2ded8607df7290c49fe6aea6a7a40a24df819e68` |

Local AutoInsight analysis on 2026-10-05 returned a 96.5/100 quality score, 18 duplicate rows, 1,168 missing cells, eight recommended charts and ten evidence-backed findings. These are outputs of the current engine, not guarantees about business validity.

To use: start the app, click **Choose a file / Выбрать файл**, select this CSV and wait for the analysis. Try filtering by `channel`, examining the quality observations, and creating a mean-revenue bar chart by `campaign`. The CSV has no accompanying generation script; `scripts/generate_demo.py` generates the separate built-in sample.
