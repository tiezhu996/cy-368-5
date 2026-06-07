<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchOverview, batchUpdateOperations } from "./api/client";
import { APP_CODE, APP_NAME } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import { createFallbackOverview } from "./state/dashboard";
import type { OverviewResponse, OperationRecord, KpiItem } from "./types";
import FeatureStrip from "./components/FeatureStrip.vue";
import MetricGrid from "./components/MetricGrid.vue";
import OperationsTable from "./components/OperationsTable.vue";
import { ElMessage } from "element-plus";

const overview = ref<OverviewResponse>(createFallbackOverview());
const notice = ref(REQUEST_MESSAGES.overviewFallback);
const isUpdating = ref(false);

function goHealth() {
  window.location.href = REQUEST_MESSAGES.healthPath;
}

function computeKpis(records: OperationRecord[]): KpiItem[] {
  const total = records.length;
  const completed = records.filter(
    (r) => r.status === "已上线" || r.status === "已完成"
  ).length;
  const pending = records.filter(
    (r) => r.status === "巡检中" || r.status === "优化中"
  ).length;
  const scheduled = records.filter((r) => r.status === "排期中").length;
  const fulfillmentRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const baseKpis = [
    {
      label: "今日处理",
      value: completed.toString(),
      trend: completed > 0 ? `+${completed * 2}%` : "0%",
      tone: "primary",
    },
    {
      label: "预约/订单",
      value: scheduled.toString(),
      trend: scheduled > 0 ? `+${scheduled}%` : "0%",
      tone: "warm",
    },
    {
      label: "履约率",
      value: `${fulfillmentRate}%`,
      trend: fulfillmentRate >= 80 ? "+3%" : "持平",
      tone: "cool",
    },
    {
      label: "待处理",
      value: pending.toString(),
      trend: pending > 0 ? "需跟进" : "已全部处理",
      tone: "neutral",
    },
  ];

  return baseKpis;
}

async function handleBatchUpdate(payload: {
  keys: string[];
  status?: string;
  owner?: string;
}) {
  if (isUpdating.value) return;
  isUpdating.value = true;

  try {
    const localUpdated = [...overview.value.records].map((r) => {
      if (payload.keys.includes(r.key)) {
        return {
          ...r,
          status: payload.status ?? r.status,
          owner: payload.owner ?? r.owner,
        };
      }
      return r;
    });

    overview.value = {
      ...overview.value,
      records: localUpdated,
      kpis: computeKpis(localUpdated),
    };

    const response = await batchUpdateOperations(payload);
    overview.value = {
      ...response.overview,
      kpis: computeKpis(response.overview.records),
    };

    const actionText = payload.status
      ? `状态已更新为「${payload.status}」`
      : `负责人已调整为「${payload.owner}」`;
    ElMessage.success(`成功更新 ${response.updated} 条记录：${actionText}`);
  } catch {
    ElMessage.error("批量操作失败，请稍后重试");
    overview.value = {
      ...overview.value,
      kpis: computeKpis(overview.value.records),
    };
  } finally {
    isUpdating.value = false;
  }
}

onMounted(async () => {
  try {
    const data = await fetchOverview();
    overview.value = {
      ...data,
      kpis: computeKpis(data.records),
    };
    notice.value = "后端服务已联通，当前展示实时接口数据。";
  } catch {
    overview.value = {
      ...createFallbackOverview(),
      kpis: computeKpis(createFallbackOverview().records),
    };
    notice.value = REQUEST_MESSAGES.overviewFallback;
  }
});
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <div>
        <span class="brand-code">{{ APP_CODE }}</span>
        <h1 class="brand-title">{{ APP_NAME }}</h1>
      </div>
      <el-button type="primary" @click="goHealth">API Health</el-button>
    </header>
    <section class="workspace">
      <div class="lead-grid">
        <article class="hero-panel">
          <span class="pill">{{ notice }}</span>
          <h2>{{ overview.appName }}</h2>
          <p>{{ overview.description }}</p>
        </article>
        <MetricGrid :items="overview.kpis" />
      </div>
      <FeatureStrip :items="overview.features" />
      <section class="work-panel">
        <h2>运营任务流</h2>
        <OperationsTable
          :records="overview.records"
          @batch-update="handleBatchUpdate"
        />
      </section>
    </section>
  </main>
</template>
