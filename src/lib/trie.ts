import { VehicleRecord, TrieNode } from '@/types/vehicle';

export class VehicleTrie {
  private root: TrieNode;

  constructor() {
    this.root = {
      isEndOfWord: false,
      children: new Map(),
      records: []
    };
  }

  // 插入車輛記錄到字首樹
  insert(record: VehicleRecord): void {
    const plate = record.plate.toLowerCase().replace(/[^a-z0-9]/g, '');
    let current = this.root;

    for (const char of plate) {
      if (!current.children.has(char)) {
        current.children.set(char, {
          isEndOfWord: false,
          children: new Map(),
          records: []
        });
      }
      current = current.children.get(char)!;
      current.records.push(record);
    }
    current.isEndOfWord = true;
  }

  // 搜尋車牌號碼
  search(query: string): VehicleRecord[] {
    if (!query) return [];
    
    const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    let current = this.root;

    // 導航到查詢字串的末尾
    for (const char of normalizedQuery) {
      if (!current.children.has(char)) {
        return [];
      }
      current = current.children.get(char)!;
    }

    // 收集所有匹配的記錄
    const results = new Set<VehicleRecord>();
    
    // 精確匹配
    if (current.isEndOfWord) {
      current.records.forEach(record => {
        const recordPlate = record.plate.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (recordPlate === normalizedQuery) {
          results.add(record);
        }
      });
    }

    // 前綴匹配
    this.collectAllRecords(current, results);

    return Array.from(results).slice(0, 50); // 限制結果數量
  }

  // 模糊搜尋（包含申請人姓名、部門等）
  fuzzySearch(query: string): VehicleRecord[] {
    const normalizedQuery = query.toLowerCase();
    const results: VehicleRecord[] = [];

    // 遞迴搜尋所有記錄
    this.searchAllRecords(this.root, normalizedQuery, results);

    // 按相關性排序
    return results
      .sort((a, b) => this.calculateRelevance(b, normalizedQuery) - this.calculateRelevance(a, normalizedQuery))
      .slice(0, 20);
  }

  // 收集節點下的所有記錄
  private collectAllRecords(node: TrieNode, results: Set<VehicleRecord>): void {
    node.records.forEach(record => results.add(record));
    
    for (const child of node.children.values()) {
      this.collectAllRecords(child, results);
    }
  }

  // 搜尋所有記錄進行模糊匹配
  private searchAllRecords(node: TrieNode, query: string, results: VehicleRecord[]): void {
    // 檢查當前節點的記錄
    node.records.forEach(record => {
      if (this.isMatch(record, query) && !results.includes(record)) {
        results.push(record);
      }
    });

    // 遞迴檢查子節點
    for (const child of node.children.values()) {
      this.searchAllRecords(child, query, results);
    }
  }

  // 檢查記錄是否匹配查詢
  private isMatch(record: VehicleRecord, query: string): boolean {
    const searchFields = [
      record.plate,
      record.applicantName,
      record.vehicleType,
      record.identityType,
      record.department || '',
      record.brand || '',
      record.color || ''
    ];

    return searchFields.some(field => 
      field.toLowerCase().includes(query)
    );
  }

  // 計算相關性分數
  private calculateRelevance(record: VehicleRecord, query: string): number {
    let score = 0;
    
    // 車牌完全匹配得分最高
    if (record.plate.toLowerCase().includes(query)) {
      score += 100;
    }
    
    // 申請人姓名匹配
    if (record.applicantName.toLowerCase().includes(query)) {
      score += 50;
    }
    
    // 其他欄位匹配
    if (record.vehicleType.toLowerCase().includes(query)) score += 20;
    if (record.identityType.toLowerCase().includes(query)) score += 20;
    if (record.department?.toLowerCase().includes(query)) score += 15;
    if (record.brand?.toLowerCase().includes(query)) score += 10;
    if (record.color?.toLowerCase().includes(query)) score += 10;

    return score;
  }

  // 清空字首樹
  clear(): void {
    this.root = {
      isEndOfWord: false,
      children: new Map(),
      records: []
    };
  }

  // 獲取所有記錄數量
  size(): number {
    const allRecords = new Set<VehicleRecord>();
    this.collectAllRecords(this.root, allRecords);
    return allRecords.size;
  }
}
