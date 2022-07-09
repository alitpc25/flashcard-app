import React from 'react'
import "./PaginationNav.css";

export default function PaginationNav(props) {

  return (
    <nav aria-label="..." className={props.renderedAt+"PaginationNav"}>
    <ul className="pagination">
      {
        props.pageNumberArray.map(pageNum => 
            (<li key={pageNum} className={props.currentPage===pageNum ? "page-item active":"page-item"}><button id={pageNum} className="page-link" onClick={props.handlePaginationButtonClick}>{pageNum}</button></li>)
        )
      }
    </ul>
  </nav>
  )
}
