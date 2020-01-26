{% macro render(time, title, isOpen, isLive, hasAudio, description) %}

<article class="b-schedule__show{% if isLive %} b-schedule__show -live{% endif %}">
  <details class="b-schedule__show-details" {% if isOpen %}open{% endif %}>
    <summary
      class="b-schedule__show-summary b-schedule__show-top b-schedule__grid-row"
    >
      <time class="b-schedule__show-time">
        {{ time | safe }}
        {% if isLive %}
        <span class="b-schedule__live-tag t-smallcaps">Live on air</span>
        {% endif %}
      </time>
       <i class="b-schedule__chevron c-icon c-icon__inner t-size-b mx-xxs mt-b"
        ><svg aria-hidden="true"><use xlink:href="#chevron-down"></use></svg
      ></i>
      <h2 class="b-schedule__show-title t-headline my-tiny">{{ title }}</h2>
    </summary>

    {% if hasAudio %}
    <div class="b-action-bar">
      <button class="c-button -round -primary -s">
        <i
          class="c-icon c-button__inner t-size-b mr-xxxs"
          ><svg aria-hidden="true"><use xlink:href="#play"></use></svg
        ></i>
        {% if isLive %}
        Listen live
        {% else %}
        Play
        {% endif %}
      </button>
    </div>
    {% endif %}

    <div class="b-schedule__show-description t-prose t-size-m pt-xxs px-s pb-b">
      {{ description | safe }}
    </div>
  </details>
</article>

{% endmacro %}