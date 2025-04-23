import React from 'react';
import './styles/ComparisonTable.css';

/**
 * ComparisonTable Component
 * Displays a comparison table for products, features, or options
 * 
 * Expected data structure:
 * {
 *   type: "comparison_table",
 *   title: "Product Comparison",
 *   headers: ["Feature", "Product A", "Product B", "Product C"],
 *   rows: [
 *     ["Price", "$99", "$149", "$199"],
 *     ["Rating", "4.5/5", "4.8/5", "4.2/5"],
 *     ["Battery Life", "10 hours", "8 hours", "12 hours"]
 *   ],
 *   highlightedColumn: 1, // Optional, highlights a specific column (0-indexed)
 *   footer: "Prices as of January 2023", // Optional
 *   actions: [ // Optional
 *     { 
 *       label: "View Product A", 
 *       action: "view_product", 
 *       payload: { productId: "123" },
 *       column: 1 // Associates this action with column 1
 *     }
 *   ]
 * }
 */
const ComparisonTable = ({ data, onAction }) => {
  // Handle missing data
  if (!data) return null;
  
  const {
    title,
    headers = [],
    rows = [],
    highlightedColumn,
    footer,
    actions = []
  } = data;
  
  // Handle action button clicks
  const handleActionClick = (action, payload) => {
    if (onAction) {
      onAction(action, payload);
    }
  };
  
  // Get actions for a specific column
  const getColumnActions = (columnIndex) => {
    return actions.filter(action => action.column === columnIndex);
  };
  
  return (
    <div className="comparison-table-container">
      {title && <h3 className="comparison-table-title">{title}</h3>}
      
      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          {headers.length > 0 && (
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th 
                    key={index} 
                    className={highlightedColumn === index ? 'highlighted' : ''}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex} 
                    className={highlightedColumn === cellIndex ? 'highlighted' : ''}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {footer && (
        <div className="comparison-table-footer">{footer}</div>
      )}
      
      {actions.length > 0 && (
        <div className="comparison-table-actions">
          {headers.slice(1).map((header, index) => {
            const columnIndex = index + 1; // Skip the first header (usually "Feature")
            const columnActions = getColumnActions(columnIndex);
            
            if (columnActions.length === 0) return null;
            
            return (
              <div key={columnIndex} className="column-actions">
                <div className="column-name">{header}</div>
                <div className="column-buttons">
                  {columnActions.map((actionItem, actionIndex) => (
                    <button
                      key={actionIndex}
                      className={`comparison-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
                      onClick={() => handleActionClick(actionItem.action, actionItem.payload)}
                    >
                      {actionItem.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;
