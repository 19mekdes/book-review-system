import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Skeleton,
  Alert,
  useTheme,
  alpha,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';

// ============================================
// Types
// ============================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  children?: Category[];
  bookCount?: number;
  isActive?: boolean;
  color?: string;
  icon?: string;
}

export interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: number[];
  onCategoryChange: (categoryIds: number[]) => void;
  mode?: 'single' | 'multiple' | 'tree';
  displayMode?: 'chips' | 'dropdown' | 'accordion' | 'tree';
  showCounts?: boolean;
  showSearch?: boolean;
  showSelectAll?: boolean;
  showClear?: boolean;
  showExpandAll?: boolean;
  maxHeight?: number | string;
  width?: number | string;
  loading?: boolean;
  error?: string | null;
  placeholder?: string;
  emptyMessage?: string;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  className?: string;
}

// ============================================
// Tree Component
// ============================================

interface CategoryTreeItemProps {
  category: Category;
  selected: number[];
  onSelect: (id: number, checked: boolean) => void;
  level?: number;
  showCounts?: boolean;
  mode?: 'single' | 'multiple';
}

const CategoryTreeItemComponent: React.FC<CategoryTreeItemProps> = ({
  category,
  selected,
  onSelect,
  level = 0,
  showCounts = true,
  mode = 'multiple'
}) => {
  const theme = useTheme();
  
  // eslint-disable-next-line no-empty-pattern
  const [] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onSelect(category.id, event.target.checked);
  };

  const isSelected = selected.includes(category.id);
  const childrenSelected = category.children?.some(child => selected.includes(child.id));
  const allChildrenSelected = category.children?.every(child => selected.includes(child.id));

  const getCheckboxState = () => {
    if (mode === 'single') {
      return isSelected;
    }
    if (allChildrenSelected) {
      return true;
    }
    if (childrenSelected) {
      return 'indeterminate';
    }
    return false;
  };

  return (
    <TreeItem
      nodeId={category.id.toString()}
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.5,
            ml: level * 2
          }}
        >
          {mode === 'multiple' && (
            <Checkbox
              checked={isSelected}
              indeterminate={getCheckboxState() === 'indeterminate'}
              onChange={handleSelect}
              onClick={(e) => e.stopPropagation()}
              size="small"
              sx={{ p: 0.5 }}
            />
          )}
          {mode === 'single' && (
            <Radio
              checked={isSelected}
              onChange={handleSelect}
              onClick={(e) => e.stopPropagation()}
              size="small"
              sx={{ p: 0.5 }}
            />
          )}
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
              color: isSelected ? theme.palette.primary.main : 'inherit'
            }}
          >
            {category.icon ? (
              <Box component="span" sx={{ fontSize: '1.2rem' }}>
                {category.icon}
              </Box>
            ) : (
              <CategoryIcon fontSize="small" color={isSelected ? 'primary' : 'action'} />
            )}
            
            <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
              {category.name}
            </Typography>
            
            {showCounts && category.bookCount !== undefined && (
              <Chip
                size="small"
                label={category.bookCount}
                variant="outlined"
                sx={{
                  ml: 'auto',
                  height: 20,
                  '& .MuiChip-label': { px: 1, fontSize: '0.7rem' }
                }}
              />
            )}
          </Box>
        </Box>
      }
      sx={{
        '& .MuiTreeItem-content': {
          py: 0.5,
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1)
          },
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.1)
          }
        }
      }}
    >
      {hasChildren && category.children?.map((child) => (
        <CategoryTreeItemComponent
          key={child.id}
          category={child}
          selected={selected}
          onSelect={onSelect}
          level={level + 1}
          showCounts={showCounts}
          mode={mode}
        />
      ))}
    </TreeItem>
  );
};

// ============================================
// Main Component
// ============================================

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
  mode = 'multiple',
  displayMode = 'accordion',
  showCounts = true,
  showSearch = true,
  showSelectAll = true,
  showClear = true,
  showExpandAll = true,
  maxHeight = 400,
  width = '100%',
  loading = false,
  error = null,
  placeholder = 'Select categories',
  emptyMessage = 'No categories found',
  onSearch,
  onRefresh,
  className
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories);

  // Build category tree from flat list
  const buildCategoryTree = useCallback((cats: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>();
    const roots: Category[] = [];

    // First pass: create map of all categories
    cats.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    cats.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(category);
      } else {
        roots.push(category);
      }
    });

    return roots;
  }, []);

  const categoryTree = React.useMemo(() => buildCategoryTree(categories), [categories, buildCategoryTree]);

  // Filter categories based on search
  useEffect(() => {
    if (!searchQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredCategories(categories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filterCategories = (cats: Category[]): Category[] => {
      return cats.reduce<Category[]>((acc, cat) => {
        const matches = cat.name.toLowerCase().includes(query) ||
                       cat.slug.toLowerCase().includes(query);
        
        const filteredChildren = cat.children ? filterCategories(cat.children) : [];
        
        if (matches || filteredChildren.length > 0) {
          acc.push({
            ...cat,
            children: filteredChildren
          });
        }
        
        return acc;
      }, []);
    };

    setFilteredCategories(filterCategories(categories));
  }, [categories, searchQuery]);

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: number, checked: boolean) => {
    if (mode === 'single') {
      onCategoryChange(checked ? [categoryId] : []);
      return;
    }

    // For multiple selection, we need to handle children
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateSelectionWithChildren = (
      cats: Category[],
      id: number,
      select: boolean
    ): number[] => {
      const result: number[] = [];

      for (const cat of cats) {
        if (cat.id === id) {
          // Add/remove this category and all its children
          result.push(cat.id);
          if (cat.children) {
            const childIds = getAllChildIds(cat.children);
            result.push(...childIds);
          }
        } else {
          // Check if this category is a parent of the target
          if (cat.children) {
            const childResult = updateSelectionWithChildren(cat.children, id, select);
            if (childResult.length > 0) {
              // If any children were affected, we need to recalculate this parent's state
              result.push(cat.id);
              result.push(...childResult);
            }
          }
        }
      }

      return select ? result : [];
    };

    const getAllChildIds = (children: Category[]): number[] => {
      const ids: number[] = [];
      for (const child of children) {
        ids.push(child.id);
        if (child.children) {
          ids.push(...getAllChildIds(child.children));
        }
      }
      return ids;
    };

    if (checked) {
      // Add category and all its children
      const newIds = [...selectedCategories];
      const idsToAdd = [categoryId];
      
      // Find category to get children
      const findCategory = (cats: Category[]): Category | undefined => {
        for (const cat of cats) {
          if (cat.id === categoryId) return cat;
          if (cat.children) {
            const found = findCategory(cat.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      const category = findCategory(categories);
      if (category?.children) {
        idsToAdd.push(...getAllChildIds(category.children));
      }

      idsToAdd.forEach(id => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });

      onCategoryChange(newIds);
    } else {
      // Remove category and all its children
      const idsToRemove = [categoryId];
      
      const findCategory = (cats: Category[]): Category | undefined => {
        for (const cat of cats) {
          if (cat.id === categoryId) return cat;
          if (cat.children) {
            const found = findCategory(cat.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      const category = findCategory(categories);
      if (category?.children) {
        idsToRemove.push(...getAllChildIds(category.children));
      }

      onCategoryChange(selectedCategories.filter(id => !idsToRemove.includes(id)));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const getAllCategoryIds = (cats: Category[]): number[] => {
        return cats.reduce<number[]>((acc, cat) => {
          acc.push(cat.id);
          if (cat.children) {
            acc.push(...getAllCategoryIds(cat.children));
          }
          return acc;
        }, []);
      };
      onCategoryChange(getAllCategoryIds(categories));
    } else {
      onCategoryChange([]);
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    onCategoryChange([]);
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  // Handle expand all
  const handleExpandAll = () => {
    const getAllNodeIds = (cats: Category[]): string[] => {
      return cats.reduce<string[]>((acc, cat) => {
        acc.push(cat.id.toString());
        if (cat.children) {
          acc.push(...getAllNodeIds(cat.children));
        }
        return acc;
      }, []);
    };
    setExpanded(getAllNodeIds(categories));
  };

  // Handle collapse all
  const handleCollapseAll = () => {
    setExpanded([]);
  };

  // Render chips display
  const renderChips = () => {
    if (selectedCategories.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          No categories selected
        </Typography>
      );
    }

    const selectedCategoryNames = categories
      .filter(cat => selectedCategories.includes(cat.id))
      .map(cat => cat.name);

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
        {selectedCategoryNames.map((name) => (
          <Chip
            key={name}
            label={name}
            size="small"
            onDelete={() => {
              const cat = categories.find(c => c.name === name);
              if (cat) {
                handleCategorySelect(cat.id, false);
              }
            }}
          />
        ))}
      </Box>
    );
  };

  // Render dropdown display
  const renderDropdown = () => {
    const selectedNames = categories
      .filter(cat => selectedCategories.includes(cat.id))
      .map(cat => cat.name);

    return (
      <FormControl fullWidth size="small">
        <InputLabel>{placeholder}</InputLabel>
        <Select
          multiple={mode === 'multiple'}
          value={selectedCategories}
          onChange={(e) => onCategoryChange(e.target.value as number[])}
          input={<OutlinedInput label={placeholder} />}
          renderValue={() => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selectedNames.map((name) => (
                <Chip key={name} label={name} size="small" />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: maxHeight,
                width: 250
              }
            }
          }}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {mode === 'multiple' && (
                <Checkbox checked={selectedCategories.includes(category.id)} />
              )}
              <ListItemText primary={category.name} />
              {showCounts && category.bookCount !== undefined && (
                <Typography variant="caption" color="text.secondary">
                  ({category.bookCount})
                </Typography>
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  // Render accordion display
  const renderAccordion = () => {
    return (
      <Box sx={{ maxHeight, overflow: 'auto' }}>
        {filteredCategories.map((category) => (
          <Accordion
            key={category.id}
            disableGutters
            elevation={0}
            sx={{
              '&:before': { display: 'none' },
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {mode === 'multiple' && (
                  <Checkbox
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => handleCategorySelect(category.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                  />
                )}
                {mode === 'single' && (
                  <Radio
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => handleCategorySelect(category.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                  />
                )}
                <Typography variant="body2" fontWeight={500}>
                  {category.name}
                </Typography>
                {showCounts && category.bookCount !== undefined && (
                  <Chip
                    size="small"
                    label={category.bookCount}
                    variant="outlined"
                    sx={{ ml: 'auto' }}
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {category.children && category.children.length > 0 ? (
                <Box sx={{ pl: 2 }}>
                  {category.children.map((child) => (
                    <Box
                      key={child.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        py: 0.5
                      }}
                    >
                      {mode === 'multiple' && (
                        <Checkbox
                          checked={selectedCategories.includes(child.id)}
                          onChange={(e) => handleCategorySelect(child.id, e.target.checked)}
                          size="small"
                        />
                      )}
                      {mode === 'single' && (
                        <Radio
                          checked={selectedCategories.includes(child.id)}
                          onChange={(e) => handleCategorySelect(child.id, e.target.checked)}
                          size="small"
                        />
                      )}
                      <Typography variant="body2">
                        {child.name}
                      </Typography>
                      {showCounts && child.bookCount !== undefined && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          ({child.bookCount})
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
                  No subcategories
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  // Render tree display
  const renderTree = () => {
    return (
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onNodeToggle={(_event: any, nodeIds: React.SetStateAction<string[]>) => setExpanded(nodeIds)}
        sx={{
          maxHeight,
          overflow: 'auto',
          flexGrow: 1
        }}
      >
        {categoryTree.map((category) => (
          <CategoryTreeItemComponent
            key={category.id}
            category={category}
            selected={selectedCategories}
            onSelect={handleCategorySelect}
            showCounts={showCounts}
            mode="multiple"
          />
        ))}
      </TreeView>
    );
  };

  // Render content based on display mode
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" height={32} />
          <Skeleton variant="text" height={32} />
          <Skeleton variant="text" height={32} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }

    if (filteredCategories.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      );
    }

    switch (displayMode) {
      case 'chips':
        return renderChips();
      case 'dropdown':
        return renderDropdown();
      case 'accordion':
        return renderAccordion();
      case 'tree':
        return renderTree();
      default:
        return renderAccordion();
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        width,
        overflow: 'hidden',
        borderColor: theme.palette.divider
      }}
      className={className}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <FilterIcon fontSize="small" color="action" />
          <Typography variant="subtitle2" fontWeight={600}>
            Filter by Category
          </Typography>
          
          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            {showClear && selectedCategories.length > 0 && (
              <Tooltip title="Clear all">
                <IconButton size="small" onClick={handleClearAll}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={onRefresh}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Search */}
        {showSearch && (
          <TextField
            fullWidth
            size="small"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 1 }}
          />
        )}

        {/* Action buttons */}
        {(showSelectAll || showExpandAll) && displayMode !== 'chips' && displayMode !== 'dropdown' && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {showSelectAll && mode === 'multiple' && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleSelectAll(true)}
                disabled={selectedCategories.length === filteredCategories.length}
              >
                Select All
              </Button>
            )}
            {showExpandAll && displayMode === 'tree' && (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleExpandAll}
                >
                  Expand All
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCollapseAll}
                >
                  Collapse All
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ position: 'relative' }}>
        {loading && (
          <LinearProgress
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          />
        )}
        {renderContent()}
      </Box>

      {/* Footer with selection count */}
      {selectedCategories.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.primary.main, 0.04)
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// Need to import missing dependencies
 

export default CategoryFilter;