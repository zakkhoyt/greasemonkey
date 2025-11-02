


* I tried 5 different user scripts and none of them worked




```html
<td>
  <div class="react-directory-commit-age">
  <relative-time class="sc-aXZVg" tense="past" datetime="2025-06-30T17:34:59.000Z" title="Jun 30, 2025, 11:34 AM MDT">
    Jun 30, 2025
  </relative-time>
</div>
</td>
```


```html
<!-- A date from https://github.com/hatch-baby/HatchSleep-iOS/pulls -->
<relative-time datetime="2025-06-26T19:05:47Z" class="no-wrap" title="Jun 26, 2025, 1:05 PM MDT">
  Jun 26, 2025
</relative-time>
```


We can add an additional column for formatted date. 


Example before modification

```html
<tr class="react-directory-row undefined" id="folder-row-2">
  <td class="react-directory-row-name-cell-small-screen" colspan="2">
    <div class="react-directory-filename-column">
      <svg aria-hidden="true" focusable="false" class="octicon octicon-file-directory-fill icon-directory"
        viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible"
        style="vertical-align: text-bottom; --darkreader-inline-fill: currentColor;" data-darkreader-inline-fill="">
        <path
          d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z">

        </path>
      </svg>
      <div class="overflow-hidden">
        <div class="react-directory-filename-cell">
          <div class="react-directory-truncate">
            <a title="ApolloCodegen" aria-label="ApolloCodegen, (Directory)" class="Link--primary"
              href="/hatch-baby/HatchSleep-iOS/tree/development/ApolloCodegen" data-discover="true">ApolloCodegen</a>
          </div>
        </div>
      </div>
    </div>
  </td>
  <td class="react-directory-row-name-cell-large-screen" colspan="1">
    <div class="react-directory-filename-column">
      <svg aria-hidden="true" focusable="false" class="octicon octicon-file-directory-fill icon-directory"
        viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible"
        style="vertical-align: text-bottom; --darkreader-inline-fill: currentColor;" data-darkreader-inline-fill="">
        <path
          d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z">

        </path>
      </svg>
      <div class="overflow-hidden">
        <div class="react-directory-filename-cell">
          <div class="react-directory-truncate">
            <a title="ApolloCodegen" aria-label="ApolloCodegen, (Directory)" class="Link--primary"
              href="/hatch-baby/HatchSleep-iOS/tree/development/ApolloCodegen" data-discover="true">ApolloCodegen</a>
          </div>
        </div>
      </div>
    </div>
  </td>
  <td class="react-directory-row-commit-cell">
    <div>
      <div class="react-directory-commit-message">
        <a data-pjax="true" title="Resolving packages from merged PR #5969 (#5979)

Updates Swift dependencies, graphs, and attribution in response to
merged pull request: [[HSD-13174] IA Edit UX: Content
Preview](https://github.com/hatch-baby/HatchSleep-iOS/pull/5969)" class="Link--secondary"
          href="/hatch-baby/HatchSleep-iOS/commit/238c2efb61586fa5df06f57db1aecad4c721ca8a">Resolving packages from
          merged PR</a> <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="3183659010"
          data-permission-text="Title is private" data-url="https://github.com/hatch-baby/HatchSleep-iOS/issues/5969"
          data-hovercard-type="pull_request" data-hovercard-url="/hatch-baby/HatchSleep-iOS/pull/5969/hovercard"
          href="https://github.com/hatch-baby/HatchSleep-iOS/pull/5969" aria-keyshortcuts="Alt+ArrowUp">#5969</a> <a
          data-pjax="true" title="Resolving packages from merged PR #5969 (#5979)

Updates Swift dependencies, graphs, and attribution in response to
merged pull request: [[HSD-13174] IA Edit UX: Content
Preview](https://github.com/hatch-baby/HatchSleep-iOS/pull/5969)" class="Link--secondary"
          href="/hatch-baby/HatchSleep-iOS/commit/238c2efb61586fa5df06f57db1aecad4c721ca8a">(</a>
        <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="3189320574"
          data-permission-text="Title is private" data-url="https://github.com/hatch-baby/HatchSleep-iOS/issues/5979"
          data-hovercard-type="pull_request" data-hovercard-url="/hatch-baby/HatchSleep-iOS/pull/5979/hovercard"
          href="https://github.com/hatch-baby/HatchSleep-iOS/pull/5979" aria-keyshortcuts="Alt+ArrowUp">#5979</a>
        <a data-pjax="true" title="Resolving packages from merged PR #5969 (#5979)

Updates Swift dependencies, graphs, and attribution in response to
merged pull request: [[HSD-13174] IA Edit UX: Content
Preview](https://github.com/hatch-baby/HatchSleep-iOS/pull/5969)" class="Link--secondary"
          href="/hatch-baby/HatchSleep-iOS/commit/238c2efb61586fa5df06f57db1aecad4c721ca8a">)</a>
      </div>
    </div>
  </td>
  <td>
    <div class="react-directory-commit-age">
      <relative-time class="sc-aXZVg" tense="past" datetime="2025-06-30T17:34:59.000Z"
        title="Jun 30, 2025, 11:34 AM MDT">Jun 30, 2025</relative-time>
    </div>
  </td>

  <!-- Add this table cell (derived form the previous) -->
  <td>Jun 30, 2025, 11:34 AM MDT</td>
</tr>


```

## Before
```html
<relative-time class="sc-aXZVg" tense="past" datetime="2025-06-23T22:50:06.000Z" title="Jun 23, 2025, 4:50 PM MDT">Jun 23, 2025</relative-time>
```

### Timezone format
Replace with attribute for `title`. 
Maybe drop the timezone?
```html
Jun 23, 2025, 4:50 PM MDT
```

### ISO-8601

Replace with attribute for `datetime`
```html
2025-06-23T22:50:06.000Z
```

### Custom
Transform iso8601 datestring from attribute `datetime`
```html
2025-06-23T22:50:06.000Z
```
