<script setup lang="ts">
import { ref, computed } from "vue";
import type { OperationRecord } from "../types";

const props = defineProps<{ records: OperationRecord[] }>();
const emit = defineEmits<{
  (e: "batchUpdate", payload: { keys: string[]; status?: string; owner?: string }): void;
}>();

const statusOptions = ["已上线", "排期中", "巡检中", "优化中", "可导出", "已完成", "已关闭"];
const ownerOptions = ["运营组", "管理员", "服务台", "财务组", "审核组", "技术组"];

const selectedRecords = ref<OperationRecord[]>([]);
const selectedStatus = ref("");
const selectedOwner = ref("");
const tableRef = ref();

const hasSelection = computed(() => selectedRecords.value.length > 0);
const selectionText = computed(() =>
  hasSelection.value ? `已选择 ${selectedRecords.value.length} 项` : ""
);

function handleSelectionChange(selection: OperationRecord[]) {
  selectedRecords.value = selection;
}

function handleBatchStatus() {
  if (!hasSelection.value || !selectedStatus.value) return;
  const keys = selectedRecords.value.map((r) => r.key);
  emit("batchUpdate", { keys, status: selectedStatus.value });
  clearSelection();
}

function handleBatchOwner() {
  if (!hasSelection.value || !selectedOwner.value) return;
  const keys = selectedRecords.value.map((r) => r.key);
  emit("batchUpdate", { keys, owner: selectedOwner.value });
  clearSelection();
}

function clearSelection() {
  if (tableRef.value) {
    tableRef.value.clearSelection();
  }
  selectedStatus.value = "";
  selectedOwner.value = "";
}
</script>

<template>
  <div class="operations-table-wrapper">
    <div v-if="hasSelection" class="batch-toolbar">
      <span class="selection-info">{{ selectionText }}</span>
      <el-select
        v-model="selectedStatus"
        placeholder="批量改状态"
        size="default"
        style="width: 160px"
        @change="handleBatchStatus"
      >
        <el-option
          v-for="status in statusOptions"
          :key="status"
          :label="status"
          :value="status"
        />
      </el-select>
      <el-select
        v-model="selectedOwner"
        placeholder="调整负责人"
        size="default"
        style="width: 160px"
        @change="handleBatchOwner"
      >
        <el-option
          v-for="owner in ownerOptions"
          :key="owner"
          :label="owner"
          :value="owner"
        />
      </el-select>
      <el-button size="default" @click="clearSelection">取消选择</el-button>
    </div>
    <el-table
      ref="tableRef"
      :data="records"
      style="width: 100%"
      size="large"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="模块" />
      <el-table-column prop="owner" label="负责人" />
      <el-table-column prop="status" label="状态" />
      <el-table-column prop="metric" label="指标" />
    </el-table>
  </div>
</template>

<style scoped>
.operations-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.batch-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: color-mix(in srgb, #546a7b 10%, transparent);
  border: 1px solid color-mix(in srgb, #546a7b 25%, transparent);
  border-radius: 8px;
}

.selection-info {
  font-weight: 700;
  color: #1d2229;
  margin-right: 8px;
}
</style>
