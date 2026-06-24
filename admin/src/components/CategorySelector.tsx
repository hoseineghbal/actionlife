import { useMemo, useState } from 'react';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  parent?: string | { _id: string; name: string; slug: string };
}

interface CategorySelectorProps {
  categories: CategoryItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

interface TreeNode {
  category: CategoryItem;
  children: TreeNode[];
}

function buildTree(categories: CategoryItem[]): TreeNode[] {
  const catMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Create all nodes
  for (const cat of categories) {
    catMap.set(cat._id, { category: cat, children: [] });
  }

  // Build tree
  for (const cat of categories) {
    const node = catMap.get(cat._id)!;
    const parentId = typeof cat.parent === 'string' ? cat.parent : (cat.parent as { _id: string })?._id;
    if (parentId && catMap.has(parentId)) {
      catMap.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function CategoryNode({
  node,
  depth,
  selectedIds,
  onToggle,
  searchTerm,
}: {
  node: TreeNode;
  depth: number;
  selectedIds: string[];
  onToggle: (id: string) => void;
  searchTerm: string;
}) {
  const matchesSearch = node.category.name.toLowerCase().includes(searchTerm.toLowerCase());
  const childrenMatch = node.children.some(
    (child) =>
      child.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.children.some((gc) => gc.category.name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (searchTerm && !matchesSearch && !childrenMatch) return null;

  return (
    <div>
      <label
        className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-sm ${
          depth > 0 ? 'pr-8' : ''
        } ${depth > 1 ? 'pr-12' : ''}`}
      >
        <input
          type="checkbox"
          checked={selectedIds.includes(node.category._id)}
          onChange={() => onToggle(node.category._id)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className={`${depth === 0 ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
          {node.category.name}
        </span>
        {depth === 0 && node.children.length > 0 && (
          <span className="text-xs text-gray-400">({node.children.length} زیردسته)</span>
        )}
      </label>
      {node.children.length > 0 && (
        <div className="border-r-2 border-gray-100 mr-3">
          {node.children.map((child) => (
            <CategoryNode
              key={child.category._id}
              node={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              onToggle={onToggle}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategorySelector({ categories, selectedIds, onChange }: CategorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const tree = useMemo(() => buildTree(categories), [categories]);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (categories.length === 0) {
    return (
      <p className="text-gray-500 text-sm border rounded-lg p-3">
        دسته‌بندی‌ای یافت نشد. ابتدا در بخش "مدیریت دسته‌بندی‌ها" دسته‌بندی ایجاد کنید.
      </p>
    );
  }

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="جستجوی دسته‌بندی..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
        {tree.map((node) => (
          <CategoryNode
            key={node.category._id}
            node={node}
            depth={0}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            searchTerm={searchTerm}
          />
        ))}
      </div>
      {selectedIds.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {selectedIds.length} دسته‌بندی انتخاب شده
        </p>
      )}
    </div>
  );
}
