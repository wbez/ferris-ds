{% macro render(anchors, name, datestamp, isActive) %}

{% if isActive %}
<td class="b-schedule__dates-td b-schedule__date b-schedule__date-active">
  {% for anchor in anchors %}
    <span class="b-schedule__date-anchor" id="{{ anchor }}"></span>
  {% endfor %}
    <div class="b-schedule__date-title t-smallcaps">{{ name }}</div>
    <div class="b-schedule__date-datestamp">{{ datestamp }}</div>
</td>

{% else %}
<td class="b-schedule__dates-td b-schedule__date">
  <a href="#{{ anchors[0] }}">
  {% for anchor in anchors %}
    <span class="b-schedule__date-anchor" id="{{ anchor }}"></span>
  {% endfor %}
    <div class="b-schedule__date-title t-smallcaps">{{ name }}</div>
    <div class="b-schedule__date-datestamp">{{ datestamp }}</div>
  </a>
</td>

{% endif %}

{% endmacro %}