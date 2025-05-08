import { TimeZoneSelect } from "@/components/timezone-select";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock ResizeObserver which is not available in the test environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView which is not available in the test environment
Element.prototype.scrollIntoView = vi.fn();

describe("TimeZoneSelect", () => {
  it("Should render correctly", () => {
    render(
      <TimeZoneSelect
        selectedTimeZone="Europe/Paris"
        onTimeZoneChange={vi.fn()}
      />
    );

    expect(screen.getByText("Europe/Paris")).toBeInTheDocument();
  });

  it("should change when click on a new timezone", () => {
    const onTimeZoneChange = vi.fn();
    render(
      <TimeZoneSelect
        selectedTimeZone="Europe/Paris"
        onTimeZoneChange={onTimeZoneChange}
      />
    );

    const timezone = screen.getByText("Europe/Paris");
    fireEvent.click(timezone);

    const pacificMidwayOption = screen.getByText("(UTC-11) Pacific/Midway");
    fireEvent.click(pacificMidwayOption);

    expect(onTimeZoneChange).toHaveBeenCalledWith("Pacific/Midway");
  });
});
